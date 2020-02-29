const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://Amanda:LC1IqG4Kuel4WXcd@cluster0-uztqh.mongodb.net/shop?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({ 
        secret: 'my secret', 
        resave: false, 
        saveUninitialized: false,
        store: store 
    })
);

app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
        console.log(error);
    })
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
.connect(MONGODB_URI)
.then(result => {
    console.log(result);
    // User.findOne()
    //     .then(user => {
    //         if(!user) {
    //             const user = new User({
    //                 name: 'Amanda',
    //                 email: 'test@test.com',
    //                 cart: {
    //                     items: []
    //                 }
    //             })
    //             user.save();
    //         }
    //     })
    app.listen(3000);
})
.catch(error => {
    console.log(error);
})