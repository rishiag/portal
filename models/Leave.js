const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId :{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  leaveType: String,
  to : Array,
  departDate : Date,
  departTime : String,
  arrivalDate : Date,
  arrivalTime : String,
  reason : String,
  combiningWithCusualStation : Boolean,
  addressDuringLeave : String,
  status : String,
  leaveAppDeclineReason : String,
  approver : String,
  approvalDate : Date,
  leaveDays : {type : Number, default:0},
  lastApprovedLeaveDetails : {type : Object}
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;