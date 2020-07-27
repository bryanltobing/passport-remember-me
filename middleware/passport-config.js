const LocalStrategy = require('passport-local').Strategy;
const RememberStrategy = require('passport-remember-me').Strategy;
const uuid = require('uuid');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/users');

module.exports = function(passport) {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            return done(null, user);
        } catch(err) {
            return done(err);
        }
    });

    // Local Strategy
    const authenticateUser = async (email, password, done) => {
        const user = await User.findOne({ email });
        if(!user) {
            return done(null, false, { message : 'That email is not registered'});
        }

        try {
           const isMatch = await bcrypt.compare(password, user.password);
           if(isMatch) {
               return done(null, user);
           }
           return done(null, false, { message : 'Password incorrect'});
        } catch (e) {
            return done(e);
        }
    };
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, authenticateUser )
    );

    // Remember me Strategy
    const verifyToken = async(token, done) => {
        console.log('verifytoken called', token);
        try {
            const user = await User.findOne({ rememberMe : token });
            done(null, user);
        } catch(e) {
            console.log("No user token", + e);
        }
    }

    // Invalidated after being used
    const issueToken = async (user, done) => {
        console.log('issuesToken called', user);
        const token = uuid.v4();
        user.rememberMe = token;
        try {
            await user.save();
            done(null, token);
        } catch(e) {
            console.log("Invalidated error" + e);
        }
    };

    passport.use(new RememberStrategy(verifyToken, issueToken));

    
};