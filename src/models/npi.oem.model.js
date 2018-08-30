var mongoose = require('mongoose')
let Npi = require('./npi.model')

var OemSchema = new mongoose.Schema({
    inStockDate: {
        fixed: {
            type: Date,
            default: null
        },
        offset: {
            type: Number,
            default: null
        }
    },
    regulations: {
        type: [String],
        enum: [null, 'ABNT', 'ANATEL', 'INMETRO', 'ANVISA', 'other'],
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
    oemActivities: {
        type: [{
            title: {
                type: String,
                default: null
            },
            dept: {
                type: String,
                default: null
            },
            date: {
                type: Date,
                default: null
            },
            comment: {
                type: String,
                default: null
            },
            annex: {
                type: String,
                default: null
            }
        }]
    },
    clientApproval: {
        approval: {
            type: String,
            enum: [null, 'accept', 'deny'],
            default: null
        },
        comment: {
            type: String,
            default: null
        }
    }
})

/*
OemSchema.pre('save', async function (next) { 
    if (!this.isModified('inStockDate')) return next();
    if (this.inStockDate.fixed == null && this.inStockDate.offset == null)
        next(new Error('Campo "Data em Estoque deve ser preenchido'))
    return next();
});
*/

Npi.discriminator(
    'oem',
    OemSchema
);

const OemNpi = mongoose.model('oem')
module.exports = OemNpi;
