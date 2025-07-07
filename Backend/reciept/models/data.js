const mongoose = require("mongoose")

const dataSchema = new mongoose.Schema({
  partyName: {
    type: String,
    required: true
  },
  vehicleNo: {
    type: String,
    required: true
  },
  material: {
    type: String
  },
  measurement: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  tareWt: {
    type: Number,
    required: true
  },
  netWt: {
    type: Number
  },
  location: {
    type: String,
    required: true
  },

  image1: {
    data: Buffer,
    contentType: String
  },
  date1: { type: String, default: () => new Date().toISOString() },
  time1: { type: String },
  image2: {
    data: Buffer,
    contentType: String
  },


});

module.exports = mongoose.model('data', dataSchema)