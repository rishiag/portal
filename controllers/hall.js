const HallOfFame = require('../models/HallOfFame');
const mongoose = require('mongoose');
const fs = require('fs');
const underscore = require('underscore')

module.exports.saveHallOfFame = function (req, res) {
    var hall = new HallOfFame({
        hallOfFameContent: req.body.hallOfFameContent,
        creator: { name: req.body.name, email: req.body.email },
        eventCategory: req.body.category,
        eventSubCategory: req.body.subCategory
    });

    hall.save(function (err) {
        console.log(err);
        if (!err)
            module.exports.getHallOfFame(req, res);
        else
            res.send({ status: 400, message: 'Error adding Hall Of Fame....' });
    })

}

module.exports.getHallOfFame = function (req, res) {
    HallOfFame.find({}, function (err, hallArr) {
        if (!err) {
            if (hallArr.length > 0) {
                var categoryGroupData = underscore.groupBy(hallArr, 'eventCategory');
                var keys = Object.keys(categoryGroupData);
                var newObj = {};
                keys.forEach(function (key) {
                    newObj[key] = underscore.groupBy(categoryGroupData[key], 'eventSubCategory');
                })
                res.send({ status: 200, message: 'Success', data: newObj });
            } else {
                res.send({ status: 200, message: 'Success', data: hallArr });
            }
        } else {
            res.send({ status: 404, message: 'Error finding Hall Of Fame' });
        }
    })
}

module.exports.updateHallOfFame = function (req, res) {
    console.log(req.body)
    HallOfFame.update({ _id: req.body.id }, { $set: { hallOfFameContent: req.body.hallOfFameContent } }, function (err) {
        if (!err) {
            module.exports.getHallOfFame(req, res);
        } else {
            res.send({ status: 404, message: 'Error updating Hall Of Fame' });
        }
    })
}

module.exports.deleteteHallOfFame = function (req, res) {
    HallOfFame.remove({ _id: req.query.id }, function (err) {
        if (!err) {
            module.exports.getHallOfFame(req, res);
        } else {
            res.send({ status: 404, message: 'Error updating Hall Of Fame' });
        }
    })
}