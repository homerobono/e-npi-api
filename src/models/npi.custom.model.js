var mongoose = require('mongoose')
let Npi = require('./npi.model')

Npi.discriminator(
    'custom',
    new mongoose.Schema({
        cost: {
            type: Number,
            default: null
        },
        price: {
            type: Number,
            default: null
        },
        inStockDate: {
            type: Date,
            default: null
        },
        regulations : {
            type : [String],
            default: null
        },
        demand: {
            amount: {
                type: Number,
                default: null
            },
            period: {
                type: String,
                enum: [null, 'year', 'month', 'day', 'unique'],
                default: null
            }
        },
    })
);

const CustomNpi = mongoose.model('custom')
module.exports = CustomNpi;
