var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
//var sequence = require('mongoose-sequence')(mongoose);

var options = { discriminatorKey: 'String' };

var NpiSchema = new mongoose.Schema({
    number: {
        type: Number,
        unique: true,
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    },
    stage: {
        type: Number,
        min: 0,
        max: 4,
        default: 1,
        required: true
    },
    npiRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Npi',
        default: null
    },
    complexity: {
        type: String,
        default: null
    },
    annex: String,
    client: {
        type: String,
        default: null
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    resources: {
        description: {
            type: String,
            default: null
        },
        annex: {
            type: [String],
            default: null
        }
    },
    norms: {
        description: {
            type: String,
            default: null
        },
        annex: {
            type: [String],
            default: null
        }
    },
    investment: {
        type: Number,
        min: 1,
        default: null
    },
    fiscals:
    {
        type: String,
        default: null
    },
    projectCost: {
        cost: {
            type: Number,
            default: null
            //required : true
        },
        annex: {
            type: String,
            default: null
        }
    },
    activities: {
        type: [{
            activity: {
                type: String,
                default: null
            },
            dept: {
                type: String,
                enum: global.DEPARTMENTS,
                default: null
            },
            date: {
                type: Date,
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
        }],
        default: null
    },
    critical: {
        type: [{
            dept: {
                type: String,
                enum: global.DEPARTMENTS,
                default: null
            },
            status: {
                type: String,
                enum: [null, 'deny', 'accept', 'condition'],
                default: null
            },
            comment: {
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
        }]
    },
    options
});

NpiSchema.pre('save', async function () {
    if (this.isNew && this.number == undefined) {
        let users = await Npi.find({ 'number': { $exists: true } }, 'number').sort('number')
        let numVec = users.map(n => n.number)
        for (var number = 0, i = 0; i < numVec.length; i++) {
            if (number < numVec[i]) break;
            else if (number == numVec[i]) number++
        }
        if (number == undefined) throw Error('undefined number')
        this.number = number
    }
});

//NpiSchema.plugin(sequence, { inc_field: 'number' })
NpiSchema.plugin(mongoosePaginate)
const Npi = mongoose.model('Npi', NpiSchema)

module.exports = Npi;
