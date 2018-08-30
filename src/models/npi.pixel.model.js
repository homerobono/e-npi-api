var mongoose = require('mongoose')
let Npi = require('./npi.model')

Npi.discriminator(
    'pixel', 
    new mongoose.Schema({
        cost : {
            type : Number,
            default: null
        },
        price : {
            type : Number,
            default: null
        },
        inStockDate : {
            type : Date,
            default: null
        },
        regulations : {
            type : [String],
            enum : [null, 'ABNT', 'ANATEL', 'INMETRO', 'ANVISA', 'other'],
            default: null
        },        
        demand : {
            amount : {
                type: Number,
                default: null,
            },
            period : {
                type : String,
                enum : [null, 'year','month','day','unique'],
                default: null,
            }
        }
    })
);

const PixelNpi = mongoose.model('pixel')
module.exports = PixelNpi;
