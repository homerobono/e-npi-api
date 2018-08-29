var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var sequence = require('mongoose-sequence')(mongoose);

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
        //required : true,
        default: null
    },
    annex: String,
    client: {
        type: String,
        default: 'Pixel'
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
        type: String,
        default: null
    },
    investment: {
        type: Number,
        default: null
    },
    fiscals:
    {
        type: Number,
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
        type: [],
        default: null
    },
    critical: {
        type: [{
            dept: String,
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
                type: {
                    date: {
                        type: Date,
                        default: null
                    },
                    user: {
                        type: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User',
                        },
                        default: null
                    }
                }
            }
        }]
    },
    options
});

/*NpiSchema.pre('save', async function (next) { 
    if (!this.isModified('critical.status')) return next();
    sign()
    return next();
});

function sign(user, oldCriticalFields, newCriticalFields) {
    console.log(user)
    if (newCriticalFields) {
        for (var i = 0; i < newCriticalFields.length; i++) {
            if (newCriticalFields[i].status &&
                newCriticalFields[i].status !== oldCriticalFields[i].status) {
                console.log('singning ' + oldCriticalFields[i].dept)
                newCriticalFields[i].signature = { user: user._id, date: Date.now() }
            }
        }
    }
    return newCriticalFields
}*/

NpiSchema.plugin(sequence, { inc_field: 'number' })
NpiSchema.plugin(mongoosePaginate)
const Npi = mongoose.model('Npi', NpiSchema)

module.exports = Npi;
