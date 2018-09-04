var mongoose = require('mongoose')
let Npi = require('./npi.model')

var OemSchema = new mongoose.Schema({
    version: {
        type: Number,
        default: 1
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
    if (this.isNew){
        var version = 1
        try {
            let latestVersion = await Npi.findOne({ 'number': this.number }, 'version').sort('-version')
            if (latestVersion != null)
                version = latestVersion.version + 1
        } catch (e) { throw (e) }
        console.log('NEW VERSION V'+version)
        this.version = version
    }
});

Npi.discriminator(
    'oem',
    OemSchema
);

const OemNpi = mongoose.model('oem')
module.exports = OemNpi;
