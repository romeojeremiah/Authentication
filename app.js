var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./models/user')

mongoose.connect('mongodb://localhost:27017/auth_demo_app', { useNewUrlParser: true })

var app = express()

app.use(require('express-session')({
    secret: 'Rusty is the best and cutest dog in the world',
    resave: false,
    saveUninitialized: false
}))

app.use(bodyParser.urlencoded({ extended: true }))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.set('view engine', 'ejs')

//=======================
// ROUTES
//======================

app.get('/', function (req, res) {
    res.render('home')
})

app.get('/secret', isLoggedIn, function (req, res) {
    res.render('secret')
})

//=======================
// AUTH ROUTES
//=======================
//show signup form
app.get('/register', function (req, res) {
    res.render('register')
})
//handle user signup
app.post('/register', function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            return res.render('register')
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/secret')
        })
    })
})

//Login Routes
//render login form
app.get('/login', function (req, res) {
    res.render('login')
})
//login logic
app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), function (req, res) {
})

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/')
})

//middleware for secret route to determine if a user is logged in
function isLoggedIn(req, res, next){
    if(res.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

app.listen(3000, function (req, res) {
    console.log('Server Started')
})