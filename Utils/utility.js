var jwt = require('jsonwebtoken');
var fs = require('fs');

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

Utility.prototype.getFoldersFiles = function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };
  
    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }
  
    return info;
  }

module.exports = Utility;