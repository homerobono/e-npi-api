const config = require("../config");
var mailer = require('nodemailer');
var npiDAO = require('./models/DAO/npi.dao')
var Npi = require('./models/npi.model')
var mongoose = require('mongoose');
var bluebird = require('bluebird');

var dbUrl = 'mongodb://127.0.0.1/enpi'
mongoose.Promise = bluebird;
mongoose.connect(dbUrl)

Npi.findOne({ number: 69 }).then(npi => {
    //console.log(npi)
    let activities = npi.getActivityDependents(npi.activities[20])
    console.log("ACTIVITIES:", activities)
    activities.forEach(activity => {
        if (npi.getActivityDependencies(activity).every(a => a.closed)) {
            console.log("NOTIFY", activity.responsible, "ABOUT", activity.activity)
        }
    })
}).catch(err => console.log(err))