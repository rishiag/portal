const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  subject: String,
  to : Array,
  creator :{name : String,email:String},
  file : {name : String,filetype : String},
  content : {type:String},
  eventDate : Date,
  eventCategory : String,
  eventSubCategory : String,
  eventVanue : {type : String}
}, { timestamps: true });

const EventClub = mongoose.model('EventClub', eventSchema);

module.exports = EventClub;