const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const port = process.env.PORT;

// db
require('./config/db/mongoose');

app.set('view engine', 'ejs');

app.use(express.urlencoded( { extended : true }));
app.use(cookieParser());
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

// routes
app.use(methodOverride('_method'));
app.use(flash());

// routes use
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));

app.get('*',(req, res) => {
    res.render('404');
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});