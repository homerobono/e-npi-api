var mongoose = require('mongoose')
let Npi = require('./npi.model')

Npi.discriminator(
    'custom',
    new mongoose.Schema({
        cost: {
            value: {
                type: Number,
                default: null
            },
            currency: {
                type: String,
                enum: global.CURRENCIES,
                default: null
            },
        },
        price: {
            value: {
                type: Number,
                default: null
            },
            currency: {
                type: String,
                enum: global.CURRENCIES,
                default: null
            },
        },
        inStockDate: {
            type: Date,
            default: null
        },
        regulations: {
            standard: {
                abnt: {
                    type: Boolean,
                    default: null
                },
                anatel: {
                    type: Boolean,
                    default: null
                },
                inmetro: {
                    type: Boolean,
                    default: null
                },
                anvisa: {
                    type: Boolean,
                    default: null
                },
                other: {
                    type: Boolean,
                    default: null
                },
            },
            additional: {
                type: String,
                default: null
            },
            description: {
                type: String,
                default: null
            },
            annex: {
                type: [typeof FileClass],
                default: []
            }
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
