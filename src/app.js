const config = require("../config");

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bluebird = require('bluebird');

//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user.route');
var authRouter = require('./routes/auth.route');
var npiRouter = require('./routes/npi.route');

var app = express();

var mongoose = require('mongoose');
mongoose.Promise = bluebird;
mongoose.connect('mongodb://127.0.0.1/enpi-users')
.then(()=> { console.log(`Succesfully Connected to the Mongodb Database at URL : mongodb://127.0.0.1/enpi-users`)})
.catch(()=> { console.error(`Error Connecting to the Mongodb Database at URL : mongodb://127.0.0.1/enpi-users`)});

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(config.pathVersion, authRouter); 
app.use(config.pathVersion, usersRouter);
app.use(config.pathVersion, npiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
