const Leave = require('../models/Leave');
const User = require('../models/User');
const mongoose = require('mongoose');
const async = require('async');


module.exports.saveLeave = function (req, res) {
    async.waterfall([
        function (cb) {
            var leave = req.body;
            //console.log(leave)
            var newLeave = new Leave({
                userId: leave.userId, leaveType: leave.leaveType, departDate: leave.departDate, departTime: leave.departTime,
                arrivalDate: leave.arrivalDate, arrivalTime: leave.arrivalTime, reason: leave.reason, combiningWithCusualStation: leave.combiningWithCusualStation,
                addressDuringLeave: leave.addressDuringLeave, status: "Pending", to: ['dg@nadt.gov.in'],lastApprovedLeaveDetails : {departDate : req.body.lastApprovedLeaveDepartDate,departTime:req.body.lastApprovedLeaveDepartTime,
                arrivalDate : req.body.lastApprovedLeaveArrivalDate,arrivalTime:req.body.lastApprovedLeaveArrivalTime,leaveType:req.body.lastApprovedLeaveType}
            });
            newLeave.save(function (err) {
                if (!err) {
                    cb(null);
                } else {
                    res.send({ status: 101, message: "Error saving leave request" });
                }
            })
        }
    ], function (error, result) {
        module.exports.getLeaves(req, res);
    })
}

module.exports.getLeaves = function (req, res) {
    User.findOne({ email: req.query.email }, function (err, user) {
        if (!err) {
            if (user && user.isStudent) {
                async.parallel({
                    getLeaves: function (cb) {
                        Leave.find({ userId: user._id }).populate('userId', 'name totalLeave leavesTaken studentdata.firstName studentdata.middleName studentdata.lastName email studentdata.mobile studentdata.rollNumber studentdata.batch studentdata.department studentdata.postHeld studentdata.allowances studentdata.pay')
                            .exec(function (err, leaves) {
                                if (!err)
                                    cb(null, leaves);
                                else
                                    res.send({ status: 101, message: "Error getting leave requests" });
                            })
                    },
                    getLastApprovedLeave: function (cb) {
                        Leave.find({ userId: user._id, status: 'Approved' }, function (err, leave) {
                            if (!err)
                                cb(null, leave);
                            else
                                res.send({ status: 101, message: "Error getting leave requests" });
                        }).sort({ 'approvalDate': -1 }).limit(1);
                    }
                }, function (err, result) {
                    res.send({ status: 200, data: result.getLeaves, lastApprovedLeave: result.getLastApprovedLeave });
                });
            } else if (user) {
                Leave.find({ to: { $all: [req.query.email] } })
                    .populate('userId', 'name totalLeave leavesTaken studentdata.firstName studentdata.middleName studentdata.lastName email studentdata.mobile studentdata.rollNumber studentdata.batch studentdata.department studentdata.postHeld studentdata.allowances studentdata.pay')
                    .exec(function (err, leaves) {
                        console.log(err)
                        if (!err)
                            res.send({ status: 200, data: leaves, admin: true });
                        else
                            res.send({ status: 101, message: "Error getting leave requests" });
                    });
            }
        } else {
            res.send({ status: 101, message: "Error getting leave requests" });
        }
    })
}

module.exports.approveOrDecline = function (req, res) {
    // console.log(req.body)
    var leavesT;
    async.waterfall([
        function (cb) {
            // var reqLeave = req.body.leave.arrivalDate - req.body.leave.departDate;
            if (req.body.leaveStatus == 'Approved') {
                User.findOne({ _id: req.query.id }, { totalLeave: 1, leavesTaken: 1, email: 1 }, function (err, user) {
                    // console.log(err,user)
                    if (!err && user) {
                        leavesT = user.leavesTaken;
                        if (user.totalLeave - user.leavesTaken >= req.body.leaveDays)
                            cb(null);
                        else
                            res.send({ status: 101, message: "Candidate's Applied leaves are more than the available leaves" });
                    } else {
                        res.send({ status: 404, message: "Unkwown User" });
                    }
                })
            } else {
                cb(null);
            }

        },
        function (cb) {
            if (req.body.leaveStatus == 'Approved') {
                var date = new Date();
                date.setMonth(date.getMonth() + 1);
                var setObj = { status: req.body.leaveStatus,  approver: req.body.approver, approvalDate: date, leaveDays: req.body.leaveDays }
            } else {
                //if(req.body.leaveOldStatus == 'Approved'){
                var setObj = { status: req.body.leaveStatus,  approver: req.body.approver, leaveDays: 0 }
                //}
            }


            Leave.update({ _id: req.body.leaveId }, { $set: setObj }, function (err) {
                // console.log(err)
                if (!err)
                    cb(null);
                else {
                    res.send({ status: 101, message: "Error saving leave request" });
                }
            })


            Leave.update({ _id: req.body.leaveId }, { $addToSet: {leaveAppDeclineReason:{comment:req.body.leaveAppDeclineReason,commentor: req.body.approver,date:new Date()}} }, function (err) {
               console.log(err);
            })
        },
        function (cb) {
            if (req.body.leaveOldStatus == 'Approved' && req.body.leaveStatus == 'Declined') {
                var updateObj = { $inc: { leavesTaken: -req.body.oldLeaveDays } };
            } else if (req.body.leaveOldStatus == 'Pending' && req.body.leaveStatus == 'Declined') {
                var updateObj = { $inc: { leavesTaken: 0 } };
            } else if (req.body.leaveOldStatus == 'Pending' && req.body.leaveStatus == 'Approved') {
                var updateObj = { $inc: { leavesTaken: req.body.leaveDays } };
            } else if (req.body.leaveOldStatus == 'Declined' && req.body.leaveStatus == 'Approved') {
                var updateObj = { $inc: { leavesTaken: req.body.leaveDays } };
            }
            User.update({ _id: req.query.id }, updateObj, function (err, change) {
               // console.log('user leaves updates...',err,change)
                if (err) {
                    Leave.update({ _id: req.body.leaveId }, { $set: { status: '', leaveAppDeclineReason: '', approver: '' } }, function (err) {
                        if (!err)
                            cb(null);
                        else {
                            res.send({ status: 101, message: "Error saving leave request" });
                        }
                    })
                } else {
                    cb(null);
                }
            });
        },

    ], function (error, result) {
        req.query.email = req.body.approver;
        module.exports.getLeaves(req, res);
    })
}

module.exports.deleteLeave = function(req,res){
    Leave.remove({ _id: req.query.id }, function (err) {
        if (!err)
            module.exports.getLeaves(req, res);
        else 
            res.send({ status: 101, message: "Error saving leave request" });
        
    })
}

module.exports.commentOnLeave = function(req,res){
    Leave.update({ _id: req.query.id }, { $addToSet: {leaveAppDeclineReason:{comment:req.body.comment,commentor: req.body.commentor,date:new Date()}} }, function (err) {
        if (!err)
            res.send({ status: 200, message: "Comment Successfully Submitted" });
        else 
            res.send({ status: 101, message: "Error submitting comment" });
     })
}