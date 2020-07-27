const express = require('express');
const uuid = require('uuid');
const router = express.Router();
const passport = require('passport');

// Middleware
const { auth, notAuth } = require('../middleware/auth');

const Users = require('../models/users');

const initializePassport = require('../middleware/passport-config');
initializePassport (passport);

router.get('/login', notAuth, (req, res) => {
    res.render('login');
});

router.get('/register', notAuth,  (req,res) => {
    res.render('register');
});

router.post('/register', notAuth, async (req,res) => {
    const user = new Users(req.body);
    try {
        await user.save();
        res.redirect('/users/login');
    } catch (e) {
        res.redirect('/users/register');
    }
});

router.post('/login', notAuth, passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
}), async (req, res, next) => {
    if(!req.body.rememberMe) {
        return next();
    }
    if(!req.user.rememberMe) {
        req.user.rememberMe = uuid.v4();
        await req.user.save();
        console.log(req.user);
    }
    res.cookie('remember_me', req.user.rememberMe, {
        path: '/',
        httpOnly : true,
        maxAge : 604800000 //7 days
    });
    next();
}, (req, res) => {
    res.redirect('/');
});

router.delete('/logout', (req, res) => {
    req.logOut();
    res.cookie('remember_me', '')
    res.redirect('/users/login');
});

module.exports = router;