const Week = require('../models/Week');
const mongoose = require('mongoose');
const underscore = require('underscore');

module.exports.createNewSession = function(req,res){
    var week = new Week({
        weekName : req.body.weekName,
        sessionName : req.body.sessionName,
        facultyName : req.body.facultyName,
        facultyEmail : req.body.facultyEmail
    });

    week.save(function(err){
        req.type = 'admin';
        if (!err)
         module.exports.getWeekSession(req,res);
        else
            res.send({ status: 101, message: 'Error in session creating....' });
    })
}

module.exports.createSessionFeedback = function(req,res){
    var feedback = {contentFeedback : req.body.contentRating,presentationFeedback : req.body.presentRating,userId : req.body.userId,remark : req.body.remark};
    Week.update({_id : req.body.id},{$addToSet : {feedback : feedback} },function(err,resp){
        if (!err)
            res.send({ status: 200, message: 'Feedback saved.' });
        else
            res.send({ status: 101, message: 'Error saving feedback....' });
    })
}

module.exports.actWeekSession = function(req,res){
    Week.update({_id : req.query.id},{$set : {sessionStatus : req.body.status}},function(err) {
        if (!err)
            res.send({ status: 200, message: 'Session status changed successfully.' });
        else
            res.send({ status: 101, message: 'Error in session status update....' });
    })
}

module.exports.removeSession = function(req,res){
    Week.remove({_id : req.query.id},function(err,resp){
        if (!err)
            res.send({ status: 200, message: 'Session removed.' });
        else
            res.send({ status: 101, message: 'Error removing session....' });
    })
}

module.exports.getWeekSession = function(req,res){
    var getSession = function(){
        Week.find(criteria,projection,function(err,weekSession){
            if (!err){
                weekSession = underscore.sortBy(weekSession,'weekName')
                weekSession = underscore.groupBy(weekSession, 'weekName');
                if(req.query.type == 'faculty'){
                    var keys = Object.keys(weekSession);
                   // console.log(keys)
                   var sessionData = {};
                   var allFeed = {cont : [0,0,0,0,0],
                    pres : [0,0,0,0,0],totalUsers:0}
                    keys.forEach(function(key){
                        var sessionArr = [];
                        weekSession[key].forEach(function(session){
                            var feedback = {cont : [0,0,0,0,0],
                            pres : [0,0,0,0,0],remark : []}
                            if(session.feedback.length > 0)
                            session.feedback.forEach(function(sessionfeedback){
                                ++allFeed.totalUsers;
                                    if(sessionfeedback.contentFeedback == -1){
                                        ++feedback.cont[0];
                                        ++allFeed.cont[0]
                                    }else if(sessionfeedback.contentFeedback == 1){
                                        ++feedback.cont[1];
                                        ++allFeed.cont[1];
                                    }else if(sessionfeedback.contentFeedback == 2){
                                        ++feedback.cont[2];
                                        ++allFeed.cont[2];
                                    }else if(sessionfeedback.contentFeedback == 3){
                                        ++feedback.cont[3];
                                        ++allFeed.cont[3];
                                    }else if(sessionfeedback.contentFeedback == 4){
                                        ++feedback.cont[4];
                                        ++allFeed.cont[4];
                                    }

                                    

                                    if(sessionfeedback.presentationFeedback == -1){
                                        ++feedback.pres[0];
                                        ++allFeed.pres[0];
                                    }else if(sessionfeedback.presentationFeedback == 1){
                                        ++feedback.pres[1];
                                        ++allFeed.pres[1];
                                    }else if(sessionfeedback.presentationFeedback == 2){
                                        ++feedback.pres[2];
                                        ++allFeed.pres[2];
                                    }else if(sessionfeedback.presentationFeedback == 3){
                                        ++feedback.pres[3];
                                        ++allFeed.pres[3];
                                    }else if(sessionfeedback.presentationFeedback == 4){
                                        ++feedback.pres[4];
                                        ++allFeed.pres[4];
                                    }
                                    
                                        feedback.remark.push({content : sessionfeedback.remark,remarkDate : sessionfeedback.remarkDate})
                                });
                                sessionArr.push({sessionName : session.sessionName,feedback : feedback});  
                        });
                        sessionData[key] = sessionArr;
                    });
                    res.send({ status: 200, data : sessionData});
                }else{
                    res.send({ status: 200, data : weekSession});
                }
            }  
            else
                res.send({ status: 101, message: 'Error in getting week-session....' });
        })
    }
    if(req.query.type == 'faculty'){
        var criteria = {facultyEmail : req.query.email,"feedback.0": { "$exists": true },sessionStatus:true};
        var projection = {feedback : 1,weekName : 1, sessionName : 1};
        getSession();
    }else if(req.query.type == 'admin'){
        var criteria = {};
        var projection = {feedback : 0};
        getSession();
    }else{
        Week.aggregate([
            {
                
                $unwind : {path : '$feedback',"preserveNullAndEmptyArrays": true}
            },
            {
                
            $match : {$or : [{"feedback.userId" : req.query.id},
            {"feedback" :null}]}   
            }
            
        ],function(err,weekSession){
            if (!err){
                weekSession = underscore.sortBy(weekSession,'weekName')
                weekSession = underscore.groupBy(weekSession, 'weekName');
                res.send({ status: 200, data : weekSession});
            }  
            else
                res.send({ status: 101, message: 'Error in getting week-session....' });
        });
    }
}

module.exports.getSessionFeedback = function(req,res){
    
}