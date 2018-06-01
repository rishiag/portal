var jwt = require('jsonwebtoken');

function Utility(){  }

Utility.prototype.authenticateUser = function(req,res,next){
    var token = req.headers['x-access-token'];
        jwt.verify(token, 'portal', function(err, decoded){
            if(err)
                res.send({status:403,message:'Un-Authorized user'});
            else
                 next();
        });
    
}



Utility.prototype.secureUser = function(id,callback){
    var token = jwt.sign({ token: id },'portal', {
      expiresIn: '24h' // expires in 24 hours
    });
    callback(null,token)
}

module.exports = Utility;