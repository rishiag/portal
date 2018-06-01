const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  to: Array,
  subject: String,
  content: String,
  creator : String,
  publicOn : String,
  fileName : String,
  notificationType : {type : String , default:'official'},
  status : {type : String , default:'unread'}
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;