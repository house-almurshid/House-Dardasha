const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  details: { type: String, required: true },
  fileUrl: { type: String } // New field for file URL
});

module.exports = mongoose.model('Event', eventSchema);