const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
    weekName: String,
    sessionName : {type : String},
    sessionStatus : {type : Boolean,default:true},
    facultyName : {type : String},
    facultyEmail : {type : String},
    feedback : [{
        userId : {type : String},
        contentFeedback : {type : Number},
        presentationFeedback : {type : Number},
        remark : {type : String},
        remarkDate : {type : Date, default : Date.now}
    }]
}, { timestamps: true });

const Week = mongoose.model('Week', weekSchema);

module.exports = Week;