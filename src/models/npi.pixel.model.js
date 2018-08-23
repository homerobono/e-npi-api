var mongoose = require('mongoose')
let Npi = require('./npi.model')

Npi.discriminator(
    'pixel', 
    new mongoose.Schema({
        cost : {
            type : Number,
            //required : true
        },
        price : {
            type : Number,
            //required : true
        },
        inStockDate : {
            //required : true,
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
        }
    })
);

const PixelNpi = mongoose.model('pixel')
module.exports = PixelNpi;
