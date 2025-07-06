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
app.use(express.static(path.join(__dirname, 'public')));
// CORS configuration to allow frontend connections
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative dev server
    'https://receipt-maker-frontend.onrender.com', // Production frontend
    /\.onrender\.com$/ // Allow any Render subdomain
  ],
  credentials: true
}));

app.use('/', indexRouter);
app.use('/data', dataRouter); // <-- add this

require('dotenv').config(); // Make sure this is at the very top, before mongoose.connect

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
