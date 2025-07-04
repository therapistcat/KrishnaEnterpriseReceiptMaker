const express = require("express")
const router = express.Router()
const multer = require("multer")
const { dataSaver, pdfConverter, getSerial } = require("../controllers/dataControllers");
const data = require("../models/data");


const storage = multer.memoryStorage();
const upload = multer({storage})

router.post("/add", upload.fields([{name:"image1",maxCount:1},{name:"image2",maxCount:1}]), dataSaver);
router.post("/pdfConverter", upload.fields([{name:"image1",maxCount:1},{name:"image2",maxCount:1}]), pdfConverter)
router.get("/serial", getSerial);

module.exports = router;