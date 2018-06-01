const User = require('../models/User');
const mongoose = require('mongoose');
var _ = require('lodash');
const Utils = require('../Utils/utility')
const utility = new Utils();
const fs = require('fs');
const directoryExists = require('directory-exists');

module.exports.postRegister = (req, res, next) => {
  //console.log('from reg')
    const user = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) {
        console.error(err)
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
    User.findOne({ email: req.body.email,password: req.body.passwd},{password : 0},function(err,user){
      if(!err)
        if(user){
          utility.secureUser(user._id,function(err,token){
            var logUser = {email : user.email,_id : user._id,token : token,name : user.name};
            res.send({status:200,message:'Success',data:logUser});            
          })
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
	var walk = function(dir,front,allSubject,subject) {
		var results = [];
		var list = fs.readdirSync(dir);
		list.forEach(function(item){
			var allMaterial = fs.readdirSync(dir + '/' + item);
			var material = []
			allMaterial.forEach(function(mat){
				material.push({link:front+item+'/'+mat,title:mat.split('.')[0]});
			})
			results.push({weekName:item,material : material,subject:subject,allSubject:allSubject?allSubject:null});
		})
		return results;
  }
  var dir = 'app/training-material/';
  var dirSession = 'app/session-recorded/';
  var allSubjectSession = fs.readdirSync(dirSession);
  var allSubject = fs.readdirSync(dir);
  var training,session;
  if(req.query.subject && req.query.subject != 'null'){
       dir = dir+req.query.subject+'/';
    var front = 'training-material/'+req.query.subject+'/';
    var frontSession = 'session-recorded/'+req.query.subject+'/';
    var dirSession = dirSession+req.query.subject+'/';
    var subject = req.query.subject;
    
    directoryExists(dir, (error, result) => {
      //console.log(result); // result is a boolean;
      if(result)
         training = walk(dir,front,allSubject,subject);
      directoryExists(dirSession, (error, result) => {
      //console.log(result); // result is a boolean;
      if(result)
          session = walk(dirSession,frontSession,allSubjectSession,subject);
          res.send({status:200,data:{training:training,session:session}});
      });
      
    });

   
    // if(fs.statSync(dir))
    //    var training = walk(dir,front,fs.readdirSync(dir),subject);
    // if(fs.statSync(dirSession))
    //     var session = walk(dirSession,frontSession,fs.readdirSync(dirSession),subject);
  }else{
    var list = fs.readdirSync(dir);
    var listSession = fs.readdirSync(dirSession);
    dirSession = dirSession + listSession[0]+'/';
    var dir = dir+list[0]+'/';
    var front =  'training-material/'+list[0]+'/';
    var frontSession = 'session-recorded/'+listSession[0]+'/'
    var subject = list[0];
     training = walk(dir,front,allSubject,subject);
     session = walk(dirSession,frontSession,allSubjectSession,subject);
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
          f = f.split('.')[0]
          results.push({'fileName' : file,'date': new Date(stat.mtime),'title':f});
        }

    });

    return results;
  }
  var data = walk(dir);
    data.sort(function(a,b){
       return b.date-a.date;
   });

   data.forEach(function(item){
    var splitF = item.fileName.split(dir+'/')[1];
    item['subject'] = splitF.split('/')[0];
    item['week'] = splitF.split('/')[1];
  });
  
  res.send({status : 200,data:data});
}