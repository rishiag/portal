const EventClub = require('../models/Event');
const mongoose = require('mongoose');
const fs = require('fs');
const uuidV4 = require('uuid/v4');
const underscore = require('underscore')

module.exports.saveEvent = function(req,res){
    if(req.files.file){
        var extension = req.files.file.originalFilename.replace(/^.*\./, '');
        var fileName = uuidV4() +  '.' + extension;
        var fileObj = {name : fileName,filetype:req.files.file.type}
        fs.rename(req.files.file.path, 'app/event-files/'+fileName, function (err){
            console.log(err);
            saveMyEvent(fileObj);
        });
    }else{
        saveMyEvent();
    }
    function saveMyEvent(fileObj){
        var event = new EventClub({
            to : req.body.to,
            subject : req.body.subject,
            content : req.body.content,
            eventDate : req.body.eventDate,
            creator : req.body.creator,
            eventVanue : req.body.eventVanue,
            eventCategory :  req.body.eventType.category,
            eventSubCategory : req.body.eventType.subCategory,
            file : (fileObj ? fileObj : null)
        });
        
        event.save(function(err){
            console.log(err);
            if(!err)
                res.send({status : 200,message : "Event successfully created..."});
            else
                res.send({status : 400, message : 'Error creating event....'});
        })
    }
}

module.exports.getEvent = function(req,res){
    var getEvents = function(){
        EventClub.find(query,function(err,events){
            if(!err){
                if(events.length > 0){
                    var categoryGroupData = underscore.groupBy(events,'eventCategory');
                    var keys = Object.keys(categoryGroupData);
                    var newObj = {};
                    keys.forEach(function(key){
                        newObj[key]=underscore.groupBy(categoryGroupData[key],'eventSubCategory');
                    })
                    res.send({status:200,message:'Success',data:newObj});
                }else{
                    res.send({status:200,message:'Success',data:events});
                }
            }
            else
                res.send({status:404,message:'Error finding Events'});
        }).sort( { 'eventDate': 1 });
    }

    //console.log('past',req.query.past)

    if(req.query.past){
        var condition = {$lt : new Date()}
    }else{
        var condition = {$gte : new Date()}
    }

    if(req.query.group_name && req.query.email){
        var query = {$or:[{to:{$all : [req.query.email]}},{to:{$all : [req.query.group_name]}}],eventDate :condition};        
        getEvents();
    }
    else if(req.query.group_name){
        var query = {to:{$all : [req.query.group_name]},eventDate :condition};
        getEvents();
    }
    else if( req.query.email){
        var query = {to:{$all : [req.query.email]},eventDate :condition};
        getEvents();     
    }
    else
         res.send({status:200,message:'Success',data:[]});
}

module.exports.getupcomingEvents = function(obj,callback){
    var upcomingEvents = function(){
        EventClub.find(query,function(err,events){
            callback(null,events);
        }).sort( { 'eventDate': 1 }).limit(4);
    }
    if(obj.group_name && obj.email){
        var query = {$or:[{to:{$all : [obj.email]}},{to:{$all : [obj.group_name]}}],eventDate : {$gte : new Date()}};        
        upcomingEvents();
    }
    else if(obj.group_name){
        var query = {to:{$all : [obj.group_name]},eventDate : {$gte : new Date()}};
        upcomingEvents();
    }
    else if( obj.email){
        var query = {to:{$all : [obj.email]},eventDate : {$gte : new Date()}};
        upcomingEvents();     
    }else{
        callback(null,[]);
    }
}