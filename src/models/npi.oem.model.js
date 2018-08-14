var mongoose = require('mongoose')
let Npi = require('./npi.model')

Npi.discriminator(
    'oem', 
    new mongoose.Schema({
        inStockDate : {
            required : true,
            type : Date
        },
        regulations : {
            type : [String],
            enum : ['ABNT', 'ANATEL', 'INMETRO', 'ANVISA', 'other'],
        },        
        demand : {
            amount : Number,
            period : {
                type : String,
                enum : ['year','month','day','unique']
            }
        },
        OemActivities : {
            activityOne : {
                deadline : Date,
                comment : String,
                annex: String
            },
            activityTwo : {
                deadline : Date,
                comment : String,
                annex: String
            }
        }
    })
);

const OemNpi = mongoose.model('oem')
module.exports = OemNpi;
