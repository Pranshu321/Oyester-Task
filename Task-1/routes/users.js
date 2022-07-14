const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = []

  if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== password2) {
      errors.push({ msg: 'Password do not match!!' });
  }

  if (password.length < 6) {
      errors.push({ msg: 'Password be at least 6 characters' });
  }

  if (errors.length > 0) {
      res.render('register', {
          errors,
          name,
          email,
          password,
          password2
      })
  }
  else {
      User.findOne({ email: email }).then((user) => {
          if (user) {
              errors.push({ msg: 'User Already Registered' });
              res.render('register', {
                  errors,
                  name,
                  email,
                  password,
                  password2
              });
          }

          else {
              const newuser = new User({
                  name,
                  email,
                  password
              });

              //  console.log(newuser);
              // Hash password
              bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(newuser.password, salt, (err, hash) => {
                      if (err) throw err;

                      newuser.password = hash;

                      newuser.save().then(() => {
                        req.flash(
                          'success_msg',
                          'You are now registered and can log in'
                        );
                          res.redirect('/users/login');
                      }).catch((err) => {
                          console.log(err);
                      });
                  });
              })
          }
      })
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
