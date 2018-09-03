var mongoose = require('mongoose')
let Npi = require('./npi.model')

var OemSchema = new mongoose.Schema({
    version: {
        type: Number,
        default: 0
    },
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
    },
    versions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'oem',
        default: null
    }
})


OemSchema.pre('save', async function () {
    let versions = await Npi.find({ 'number': this.number }, 'versions').sort('versions')
    if (this.isNew && versions.length > 0) {
        console.log('creating new version')
        let versionsVec = versions.map(n => n.version)
        for (var version = 0, i = 0; i < versionsVec.length; i++) {
            if (version < versionsVec[i]) break;
            else if (version == versionsVec[i]) version++
        }
        if (version == undefined) throw Error('undefined version')
        this.version = version
    }
});

Npi.discriminator(
    'oem',
    OemSchema
);

const OemNpi = mongoose.model('oem')
module.exports = OemNpi;
