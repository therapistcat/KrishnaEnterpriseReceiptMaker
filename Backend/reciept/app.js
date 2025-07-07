require('dotenv').config(); // Load environment variables first

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

const cors = require('cors');

var indexRouter = require('./routes/index');
var dataRouter = require('./routes/data'); // <-- add this

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve React frontend from dist directory (after build) - PRIORITY
// Try multiple possible paths for frontend
const possiblePaths = [
  path.resolve(__dirname, '../../Front/dist'),           // Local development
  path.resolve(__dirname, '../../../Front/dist'),       // Alternative local
  path.resolve(process.cwd(), 'Front/dist'),            // Render deployment
  path.resolve(process.cwd(), '../Front/dist')          // Alternative Render
];

let frontendPath = null;
for (const testPath of possiblePaths) {
  if (require('fs').existsSync(testPath)) {
    frontendPath = testPath;
    break;
  }
}

console.log('Tested paths:', possiblePaths);
console.log('Selected frontend path:', frontendPath);
console.log('Frontend path exists:', frontendPath ? require('fs').existsSync(frontendPath) : false);

// Serve static files from public directory first
app.use(express.static(path.join(__dirname, 'public')));

// Serve React frontend from dist directory (but NOT for /api routes)
if (frontendPath) {
  app.use(express.static(frontendPath));
} else {
  console.error('❌ Frontend dist directory not found! Build may have failed.');
}
// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({
    status: 'OK',
    message: 'Backend is working!',
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to debug deployment
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({
    message: 'Test endpoint working',
    cwd: process.cwd(),
    __dirname: __dirname,
    frontendPath: frontendPath,
    environment: process.env.NODE_ENV
  });
});

app.use('/api/data', dataRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Catch all handler: send back React's index.html file for any non-API routes
// This must come AFTER all API routes but BEFORE error handlers
app.get('*', (req, res) => {
  // Try multiple possible paths for index.html
  const possibleIndexPaths = [
    path.resolve(__dirname, '../../Front/dist/index.html'),
    path.resolve(__dirname, '../../../Front/dist/index.html'),
    path.resolve(process.cwd(), 'Front/dist/index.html'),
    path.resolve(process.cwd(), '../Front/dist/index.html')
  ];

  let indexPath = null;
  for (const testPath of possibleIndexPaths) {
    if (require('fs').existsSync(testPath)) {
      indexPath = testPath;
      break;
    }
  }

  console.log('Serving index.html from:', indexPath);
  console.log('File exists:', indexPath ? require('fs').existsSync(indexPath) : false);

  if (indexPath) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: 'Frontend not found',
      message: 'Frontend build files are missing. Please check the build process.',
      searchedPaths: possibleIndexPaths
    });
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
