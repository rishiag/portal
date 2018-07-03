const mongoose = require('mongoose');

const hallOfFameSchema = new mongoose.Schema({
  creator :{name : String,email:String},
  hallOfFameContent : {type:String},
  eventCategory : String,
  eventSubCategory : String
}, { timestamps: true });

const HallOfFame = mongoose.model('HallOfFame', hallOfFameSchema);

module.exports = HallOfFame;