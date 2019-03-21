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
var mongoose = require('mongoose');
var filesRouter = require('./routes/file.route');
//var multer = require('multer')

//opuscapita filemanager
const fs = require('fs');
const compression = require('compression');
const filemanagerMiddleware = require('@opuscapita/filemanager-server').middleware;
const filemanagerLogger = require('@opuscapita/filemanager-server').logger;
const filemanagerConfig = {
  fsRoot: path.resolve(__dirname, '../npi-files'),
  rootName: 'Customization area'
};

var userDAO = require('./models/DAO/user.dao')
var app = express();

//angularjs-bridge
//const filesRouter = require('angular-filemanager-nodejs-bridge').router;

var dbUrl = 'mongodb://127.0.0.1/enpi'
mongoose.Promise = bluebird;
mongoose.connect(dbUrl)

mongoose.connection.on('connected',
  () => {
    console.log('Succesfully Connected to the Mongodb Database at ' + dbUrl)
    mongoose.connection.db.collection('users').countDocuments(
      (error, count) => {
        if (error) return error
        if (count == 0) {
          userDAO.createDebugUsers([
            {
            email: 'admin',
            password: 'admin',
            firstName: 'Administrador',
            level: 3,
            status: 'active',
            notify: false
          },
          {
            email: 'com',
            password: '1234',
            firstName: 'Comercial',
            lastName: 'Gestor',
            department: 'COM',
            level: 1,
            status: 'active',
            notify: false
          },
          {
            email: 'adm',
            password: '1234',
            firstName: 'Administrativo Gestor',
            lastName: 'Gestor',
            department: 'ADM',
            level: 1,
            status: 'active',
            notify: false
          },
          {
            email: 'prod',
            password: '1234',
            firstName: 'Produto Gestor',
            lastName: 'Gestor',
            department: 'MPR',
            level: 1,
            status: 'active',
            notify: false
          },
          {
            email: 'opr',
            password: '1234',
            firstName: 'Operações Gestor',
            lastName: 'Gestor',
            department: 'OPR',
            level: 1,
            status: 'active',
            notify: false
          },
          {
            email: 'compras',
            password: '1234',
            firstName: 'Compras Gestor',
            department: 'OSC',
            level: 1,
            status: 'active',
            notify: false
          },
          {
            email: 'proc',
            password: '1234',
            firstName: 'Processo Gestor',
            lastName: 'Gestor',
            department: 'MEP',
            level: 1,
            status: 'active',
            notify: false
          },
          {
            email: 'ped',
            password: '1234',
            firstName: 'P&D Gestor',
            lastName: 'Gestor',
            department: 'MPD',
            level: 1,
            status: 'active',
            notify: false
          },
        ])
          console.info('Users DB empty, created debug users')
        }
      }
    )
  })

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", global.URL_BASE);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(config.pathVersion, authRouter);
app.use(config.pathVersion, usersRouter);
app.use(config.pathVersion, npiRouter);
app.use(config.pathVersion, filesRouter);
//app.use(config.pathVersion, filemanagerMiddleware(filemanagerConfig));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
