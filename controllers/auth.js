const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendGridTransport({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      isAuthenticated: false,
      errorMessage: message
    })
  };

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if(!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if(!doMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
          }
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((error) => {
            console.log(error);
          });
          res.redirect('/');
        })
    })
    .catch(error => {
        console.log(error);
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);
    res.redirect('/');
  })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    isAuthenticated: false,
    errorMessage: message
  })
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email})
    .then(userDoc => {
      if(userDoc) {
        req.flash('error', 'This email already exists, please pick a different one.');
        return res.redirect('/signup')
      }
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save()
        })
        .then(result => {
          res.redirect('/login')
          return transporter.sendMail({
            to: email,
            from: 'nodeshop@gmail.com',
            subject: 'Welcome!',
            html: '<h1>Thanks for signing up!</h1>>'
          })
        })
        .catch(error => {
          console.log(error);
        })
    })
    .catch(error => {
      console.log(error)
    });
};