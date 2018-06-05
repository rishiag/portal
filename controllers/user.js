const User = require('../models/User');
const mongoose = require('mongoose');
var _ = require('lodash');
const Utils = require('../Utils/utility')
const utility = new Utils();
const fs = require('fs');
const directoryExists = require('directory-exists');
const bcrypt = require('bcrypt-nodejs');
const uuidV4 = require('uuid/v4');
var util = require('util');
var path = require('path');
var async = require('async');

module.exports.postRegister = (req, res, next) => {
  //console.log('from reg',req.body.passwd)
    const user = new User({
      email: req.body.email,
      password: req.body.passwd,
      name: req.body.name,
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) {
        //console.error(err)
        res.send({ status:400,message: 'Something went wrong!! Please try again later!'});
      }else{
        if (existingUser) {
          res.send({status:400 ,message: 'Account with that email address already exists.'});
        }else{

          user.save((err) => {
            if (err) { 
              console.error(err)
              res.send({  status:400,message: 'Something went wrong!! Please try again later!'});
            }else{
              res.send({  status:200,message: 'User created successfully'});
            }
          });
        }
      }
    });
};

module.exports.login = function(req,res){
  if(req.body.email && req.body.passwd){
    User.findOne({ email: req.body.email},function(err,user){
      //console.log(err,user)
      if(!err)
        if(user){
          user.comparePassword(req.body.passwd, (err, isMatch) => {
           if(!err && isMatch){
            utility.secureUser(user._id,function(err,token){
              var logUser = {email : user.email,_id : user._id,token : token,name : user.name};
              res.send({status:200,message:'Success',data:logUser});            
            })
           }else{
            res.send({status:404,message:'User password is incorrect'});
           }
          });
        }
        else
            res.send({status:404,message:'Error'});
      else
        res.send({status:404,message:'User does not exist'});
    })
  }
}


module.exports.forgot = function(req,res){
  if(req.body.email){
    User.findOne({ email: user.email },function(err,user){
      if(!err)
        if(user.length == 1){
            //sendEmail(user[0].password);
        }
        else
            res.send({status:404,message:'Error'});
      else
        res.send({status:404,message:'User does not exist'});
    })
  }
}

module.exports.getUserTags = function(req,res){
  User.aggregate([{ "$project": {
    "name" :1,
    "groupName":1,
    "email":1,
    "text": "$email"
}}],function(err,users){
    if(!err){
      var  _uniqGroupList = _.groupBy(users,"groupName");
      var uniqueUsers = _uniqGroupList[undefined]
      var groupNames = Object.keys(_uniqGroupList);
      groupNames.forEach(function(item){
        if(item != "undefined")
        uniqueUsers.push({text:item,email:item});
      })
      res.send({status:200,message:'Success',data : uniqueUsers})
    }
  })
}


module.exports.getTrainingMaterial = function(req,res){

  var dirName = '';
	var walk = function(dir,front,allSubject,subject,list) {
    var results = [];
    var listOfItem = list?list:fs.readdirSync(dir);
    //console.log(list)
		listOfItem.forEach(function(item){
			var allMaterial = fs.readdirSync(dir + '/' + item);
      var material = [];
      console.log(allMaterial,item)
      
        allMaterial.forEach(function(mat){
          if(!list){
            material.push({link:front+item+'/'+mat,title:mat.split('.')[0],id:uuidV4()});
          }else{
            var allSubjectMat = fs.readdirSync(dir + item+'/'+mat);
                allSubjectMat.forEach(function(course){
                  material.push({link:front+item+'/'+mat+course,title:course.split('.')[0],id:uuidV4()});
                })
                results.push({weekName:mat,material : material,subject:subject,allSubject:allSubject?allSubject:null});
          }
         
        })
        if(!list)
			    results.push({weekName:item,material : material,subject:subject,allSubject:allSubject?allSubject:null});
		})
		return results;
  }
  var dir = 'app/training-material/';
  var dirSession = 'app/session-recorded/';
  var allSubjectSession = fs.readdirSync(dirSession);
  //console.log('allSubjectSession',allSubjectSession)
  var allSubject = fs.readdirSync(dir);
  var training,session;
  if(req.query.subject && req.query.subject != 'null'){
       dir = dir+req.query.subject;
    var front = 'training-material/'+req.query.subject+'/';
   // var frontSession = 'session-recorded/'+req.query.subject+'/';
       // dirSession = dirSession+req.query.subject;
    var subject = req.query.subject;
    
    directoryExists(dir, (error, result) => {
      //console.log(result); // result is a boolean;
      if(result)
         training = walk(dir,front,allSubject,subject);
         
          directoryExists(dirSession+req.query.subject, (error, result) => {
          //  console.log('dirSession',result,dirSession); // result is a boolean;
            if(result)
                session = walk(dirSession+req.query.subject,'session-recorded/'+req.query.subject+'/',allSubjectSession,subject);
            else
                session = walk(dirSession,'session-recorded/',allSubjectSession,allSubjectSession[0],allSubjectSession);

                res.send({status:200,data:{training:training,session:session}});
          });
    });
  }else{
    var list = fs.readdirSync(dir);
    var listSession = fs.readdirSync(dirSession);
    if(list.length>0){
      dir = dir+list[0]+'/';
      var front =  'training-material/'+list[0]+'/';

      var subject = list[0];
      training = walk(dir,front,allSubject,subject);
    }

    if(listSession.length > 0){
      dirSession = dirSession + listSession[0]+'/';
      var frontSession = 'session-recorded/'+listSession[0]+'/'
      session = walk(dirSession,frontSession,allSubjectSession,subject);
    }
     res.send({status:200,data:{training:training,session:session}});
  }

 
  
 
}

module.exports.getTrainingSubject = function(req,res){
  var dir = 'app/training-material/';
  var front = 'training-material/';
	var dirName = '';
	var walk = function(dir) {
		var results = [];
		var list = fs.readdirSync(dir);
		list.forEach(function(file){
      var stat = fs.statSync(dir + '/' + file);
      if (stat && stat.isDirectory()) { 
          /* Recurse into a subdirectory */
          results.push(file);
      }
		})
		return results;
  }
  var data = walk(dir);
  res.send({status:200,data:data})
}

module.exports.getTrainingMaterialHome = function(req,res){
  var dir = 'app/training-material';
	var dirName = '';
	var walk = function(dir) {
    var results = [];
		fs.readdirSync(dir).forEach(function(file) {
        var f = file
        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
        //  console.log(file)
			results=results.concat(walk(file))
        } else {
          var title = f.split('.')[0];
          results.push({'fileName' : file,'date': new Date(stat.mtime),'title':title,id:uuidV4()});
        }

    });

    return results;
  }
  var data = walk(dir);
    data.sort(function(a,b){
       return b.date-a.date;
   });
   var count = 0;
   data.forEach(function(item){
    var splitF = item.fileName.split(dir+'/')[1];
    item['path'] ='training-material/'+ item.fileName.split(dir+'/')[1];
    item['subject'] = splitF.split('/')[0];
    item['week'] = splitF.split('/')[1];
    var folders = (item.fileName.split('app/training-material/')[1]).split('/');
    folders.shift();
    folders.pop();
    item["listOfFolders"] = folders;
    count++;
  });

   console.log(data)
  
  res.send({status : 200,data:data});
}


module.exports.getFolderFiles = function(req,res){
  //if (module.parent == undefined){
   

    // function dirTree(filename) {
    //   var stats = fs.lstatSync(filename),
    //       info = {
    //           path: filename,
    //           name: path.basename(filename)
    //       };
    
    //   if (stats.isDirectory()) {
    //       info.type = "folder";
    //       info.children = fs.readdirSync(filename).map(function(child) {
    //           return dirTree(filename + '/' + child);
    //       });
    //   } else {
    //       // Assuming it's a file. In real life it could be a symlink or
    //       // something else!
    //       info.type = "file";
    //   }
    
    //  return info;
    // }

    //if (module.parent == undefined) {
      // var list =  util.inspect(dirTree('app/training-material'), false, null);
      // setTimeout(function () {
      //   console.log('boo',list);
      //   list = JSON.parse(JSON.stringify(list))
      //   res.send({status:200,data:JSON.parse(list)});
      //   // var subjects = [];
      //   // list = JSON.parse(list);
      //   // if(list.children){
      //   //   list.children.forEach(function(subject){
      //   //     subjects.push(subject.name);
      //   //   });
      //   //   res.send({status:200,data:{folderFiles: list,allSubject:subjects}});
      //   // }else{
      //   //   res.send({status:200,data:{}});
      //   // }
      // }, 100)
   // }


   var diretoryTreeToObj = function(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    diretoryTreeToObj(file, function(err, res) {
                        results.push({
                            name: path.basename(file),
                            type: 'folder',
                            children: res
                        });
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                  var link = file.split('/app/')[1];
                    results.push({
                        type: 'file',
                        link : link,
                        title : path.basename(file).split('.')[0],
                        name: path.basename(file)
                    });
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
}
var sessionSubjects = [];
var trainingSubjects = [];
async.waterfall([
  function(cb){
    diretoryTreeToObj('app/training-material', function(err, training){
      if(err)
          console.error(err);
      training.forEach(function(item){
        trainingSubjects.push(item.name);
      })
      cb(null,training);
    });
  },
  function(training,cb){
    diretoryTreeToObj('app/session-recorded', function(err, session){
      if(err)
          console.error(err);
      session.forEach(function(item){
        sessionSubjects.push(item.name);
      })
      cb(null,{training:training,session:session});
    });
  }
],function(err,result){
  result.sessionSubjects = sessionSubjects;
  result.trainingSubjects = trainingSubjects;
  res.send({status:200,data:result})
})


       
}

 

