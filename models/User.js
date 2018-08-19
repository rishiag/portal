const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  isStudent : {type : Boolean},
  role_list : ["create_timetable", "create_event", "create_hall", "edit_hall", "delete_hall",
  "update_club_info","leave_apply", "leave_approve", "leave_comment", "create_session_feedback", 
  "delete_session_feedback"],
  groupName : {type : String},
  totalLeave : Number,
  leavesTaken : Number,
  studentdata : {
    lectureGroup : {type : String},
    morningActivityGroup : {type : String},
    counsellorName : {type : String},
    houseName : {type : String},
    firstName : {type : String},
    middleName : {type : String},
    lastName : {type : String},
    dob : {type : Date},
    month : {type : Number},
    day : {type : Number},
    gender : {type : String},
    degree : {type : String},
    homeTown : {type : String},
    motherTongue : {type : String},
    mobile : {type : String},
    prevExp : {type : String},
    org : {type : String},
    rollNumber : {type :String},
    postHeld : {type : String},
    pay : {type : String},
    department : {type : String},
    allowances : {type :String},
    batch : {type :String}
  },
  facultydata : {
    areaOfSpecializaion : {type : String},
    typeOfFaculty : {type : String},
    designation : {type : String},
    officeAddress : {type : String},
    mailingAddress : {type : String},
    comment : {type : String},
    contact : {
      phone :{type : String},
      fax:{type : String}
    },
    profileDesc : {type : String}
  },
  profilePic : {type:String}
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;

  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

userSchema.methods.genPassword = function comparePassword(candidatePassword, cb) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(candidatePassword, salt, null, (err, hash) => {
      if (err)
        return cb(err);
      else
        cb(null,hash)
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
