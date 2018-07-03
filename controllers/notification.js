const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fs = require('fs');
const uuidV4 = require('uuid/v4');


module.exports.saveNotification = function (req, res) {

    if (req.files.file) {
        var file = req.files.file;
        var extension = file.originalFilename.replace(/^.*\./, '');
        var fileName = uuidV4() + '.' + extension;
        fs.rename(file.path, 'app/notice-files/' + fileName, function (err) {
            console.log(err);
        })
    }

    var notification = new Notification({
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content,
        publishOn: req.body.publishOn,
        creator: req.body.creator,
        fileName: fileName ? fileName : null
    });



    notification.save(function (err) {
        if (!err)
            res.send({ status: 200, message: "Notification successfully sent..." });
        else
            res.send({ status: 400, message: 'Error sending notification....' });
    })
}


module.exports.getNotification = function (req, res) {
    if (req.query.group_name && req.query.email) {
        var query = { $or: [{ to: { $all: [req.query.email] } }, { to: { $all: [req.query.group_name] } }] };
        getNots();
    }
    else if (req.query.group_name) {
        var query = { to: { $all: [req.query.group_name] } };
        getNots();
    }
    else if (req.query.email) {
        var query = { to: { $all: [req.query.email] } };
        getNots();
    }
    else
        res.send({ status: 200, message: 'Success', data: [] });

    function getNots() {
        if (req.query.notificationHash) {
            Notification.update({ _id: req.query.notificationHash }, { $set: { status: 'read' } }, function (err) {
                Notification.find(query, function (err, notifs) {
                    if (!err)
                        res.send({ status: 200, message: 'Success', data: notifs });
                    else
                        res.send({ status: 404, message: 'Error finding Notifications' });
                }).sort({ 'createdAt': -1 });
            });
        }
        else
            Notification.find(query, function (err, notifs) {
                if (!err)
                    res.send({ status: 200, message: 'Success', data: notifs });
                else
                    res.send({ status: 404, message: 'Error finding Notifications' });
            }).sort({ 'createdAt': -1 });
    }

}
