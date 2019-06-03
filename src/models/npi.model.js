var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var FileClass = require('./file.model')
//var sequence = require('mongoose-sequence')(mongoose);

var options = { discriminatorKey: 'String' };

var NpiSchema = new mongoose.Schema({
    number: {
        type: Number,
        //unique: true,
    },
    version: {
        type: Number,
        default: 1
    },
    versions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Npi',
        default: null
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    },
    stage: {
        type: Number,
        min: 0,
        max: 5,
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
    designThinking: {
        apply: {
            type: Boolean,
            default: null
        },
        annex: {
            type: [typeof FileClass],
            default: []
        }
    },
    description: {
        description: {
            type: String,
            default: null
        },
        annex: {
            type: [typeof FileClass],
            default: []
        }
    },
    resources: {
        description: {
            type: String,
            default: null
        },
        annex: {
            type: [typeof FileClass],
            default: []
        }
    },
    investment: {
        value: {
            type: Number,
            min: 1,
            default: null
        },
        currency: {
            type: String,
            enum: global.CURRENCIES,
            default: null
        },
        annex: {
            type: [typeof FileClass],
            default: []
        }
    },
    fiscals:
    {
        type: String,
        default: null
    },
    projectCost: {
        value: {
            type: Number,
            default: null
        },
        currency: {
            type: String,
            enum: global.CURRENCIES,
            default: null
        },
        annex: {
            type: [typeof FileClass],
            default: []
        }
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
    finalApproval: {
        status: {
            type: String,
            enum: [null, 'deny', 'accept'],
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
    },
    activities: {
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
                type: Object,
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
    validation: {
        status: {
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
        },
        final: {
            type: String,
            default: null
        },
    },
    requests: {
        type: [{
            class: {
                type: String,
                default: null
            },
            responsible: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            comment: {
                type: String,
                default: null
            },
            closed: {
                type: Boolean,
                default: false
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
            },
            analysis: {
                type: [{
                    dept: {
                        type: String,
                        enum: global.DEPARTMENTS,
                        default: null
                    },
                    status: {
                        type: String,
                        enum: [null, 'deny', 'accept'],
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
            }
        }]
    },
    updated: {
        type: Date,
        default: Date.now()
    },
    notify: {
        critical: {
            type: Date,
            default: null
        },
    },
    options
});

NpiSchema.pre('save', async function () {
    console.log("Saving")
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
    if (this.isNew) {
        var version = 1
        try {
            let latestVersion = await Npi.findOne({ 'number': this.number }, 'version').sort('-version')
            if (latestVersion != null)
                version = latestVersion.version + 1
        } catch (e) { throw (e) }
        console.log('NEW VERSION V' + version)
        this.version = version
    }
    //this.updated = Date.now()
});

//NpiSchema.plugin(sequence, { inc_field: 'number' })
NpiSchema.plugin(mongoosePaginate)
const Npi = mongoose.model('Npi', NpiSchema)

module.exports = Npi;
