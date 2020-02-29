const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      isAuthenticated: false
    })
  }

exports.postLogin = (req, res, next) => {
  User.findById('5e58056590f62796f1a5f882')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((error) => {
        console.log(error);
        res.redirect('/');
      })
    })
    .catch(error => {
        console.log(error);
    })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);
    res.redirect('/');
  })
}