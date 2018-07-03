const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  subject: String,
  creatorEmail :String,
  creatorName : String,
  fileName : String
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;