var mongoose = require('mongoose')
let Npi = require('./npi.model')

const DAYS = 1000 * 3600 * 24 // Days in milisecs

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
        none: {
            type: Boolean,
            default: null
        },
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

OemSchema.methods.getActivityEndDate = function (activity) {
    //console.log("POLYMORPHISM WORKS!!!!")
    if (this.stage < 4)
        return null

    var endDate = Date.now()

    var dayZero = this.clientApproval.signature.date

    if (activity.closed)
        endDate = activity.signature.date
    else {
        var dependencies = this.getActivityDependencies(activity)
        if (!dependencies || dependencies.length == 0) {
            endDate = new Date(dayZero.valueOf() + (DAYS - dayZero.valueOf() % DAYS) + activity.term * DAYS)
        } else {
            let dependenciesEndDatesValues = []
            dependenciesEndDatesValues = dependencies.map(d => this.getActivityEndDate(d).valueOf())
            endDate = new Date(Math.max(...dependenciesEndDatesValues) + activity.term * DAYS)
            console.log(`[npi-oem-model] [activity-end-date] #${this.number} ${activity.activity} end date: ${endDate} dependencies end dates:`, dependenciesEndDatesValues)
        }
    }

    return endDate
}

Npi.discriminator(
    'oem',
    OemSchema
);

const OemNpi = mongoose.model('oem')
module.exports = OemNpi;
