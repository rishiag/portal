const Timetable = require('../models/Timetable');
const mongoose = require('mongoose');
const fs = require('fs');

module.exports.saveTimetable = function(req,res){
    if(req.files.file){
        var file = req.files.file;
        fs.rename(file.path, 'app/time-table/'+file.originalFilename, function (err){
           if(!err){
            var timetable = new Timetable({
                subject : req.body.subject,
                creatorName : req.body.creatorName,
                creatorEmail : req.body.creatorEmail,
                fileName : file.originalFilename
            });
            timetable.save(function(err){
                if(!err)
                    res.send({status : 200,message : "Time table successfully created..."});
                else
                    res.send({status : 400, message : 'Error creating time table....'});
            })
        }else{
            res.send({status : 400, message : 'Time table not created, please try again....'});
         }
        })
    }else{
        res.send({status : 400, message : 'Time table not found....'});
    }
}

module.exports.getTimetable = function(req,res){
    Timetable.find({},function(err,timetables){
        if(!err){
            res.send({status:200, data : timetables,message:'success',folder : 'time-table/'})
        }else{
            res.send({status:404, message:'Error getting time table'})
        }
    }).sort( { 'createdAt': -1 });
}