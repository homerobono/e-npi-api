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
    oemActivities: {
        type: [{
            activity: {
                type: String,
                default: null
            },
            apply: {
                type: Boolean,
                default: true
            },
            dept: {
                type: String,
                enum: (Array.from(global.DEPARTMENTS).concat([null])),
                default: null
            },
            responsible: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            term: {
                type: Number,
                default: null
            },
            registry: {
                type: String,
                default: null
            },
            annex: {
                type: String,
                default: null
            },
            closed: {
                type: Boolean,
                default: false,
            },
            signature: {
                date: {
                    type: Date,
                    default: null
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    default: null
                }
            }
        }],
        default: null
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
        },
        annex: {
            type: String,
            default: null
        },
        signature: {
            date: {
                type: Date,
                default: null
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            }
        }
    },
})

Npi.discriminator(
    'oem',
    OemSchema
);

const OemNpi = mongoose.model('oem')
module.exports = OemNpi;
