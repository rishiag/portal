const User = require('../models/User');
const mongoose = require('mongoose');


exports.postRegister = (req, res, next) => {

  req.assert('name', 'Name is required').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 8 characters long').len(8);

  const errors = req.validationErrors();

  if (errors) {
    res.status(400).send({ error: errors});
  }else{

    const user = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    User.findOne({ email: user.email }, (err, existingUser) => {
      if (err) {
        console.error(err)
        res.status(400).send({ error: 'Something went wrong!! Please try again later!'});
      }else{

        if (existingUser) {
          res.status(400).send({error: 'Account with that email address already exists.'});
        }else{

          user.save((err) => {
            if (err) { 
              console.error(err)
              res.status(400).send({ error: 'Something went wrong!! Please try again later!'});
            }else{
              res.status(201).send({ success: 'User created successfully'});
            }
          });
        }
      }
    });
  }
};
