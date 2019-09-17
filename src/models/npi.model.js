var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var FileClass = require('./file.model')
//var sequence = require('mongoose-sequence')(mongoose);
const DAYS = 1000 * 3600 * 24 // Days in milisecs
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
            approval: {
                type: Boolean,
                default: false
            },
            closed: {
                type: Boolean,
                default: false
            },
            analisys: {
                type: [{
                    responsible: {
                        type: String,
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

NpiSchema.methods.getActiveActivities = function () {
    return this.activities.filter(a => {
        //console.log(a.closed, a.apply, this.getActivityDependencies(a).every(d => d.closed))
        return (!a.closed && a.apply && this.getActivityDependencies(a).every(d => d.closed))
    })
}

NpiSchema.methods.getActivityDependencies = function (activity) {
    let directDependenciesLabels = global[this.__t == 'oem' ? "OEM_STAGES" : "MACRO_STAGES"]
        .find(a => a.value == activity.activity).dep
    //console.log("[npi-model] Dependencies labels", directDependenciesLabels)
    let dependencies = this.activities.filter(a => directDependenciesLabels && directDependenciesLabels.includes(a.activity))
    for (let i = 0; i < dependencies.length; i++) {
        let act = dependencies[i]
        if (!act.apply) {
            dependencies.splice(i, 1)
            dependencies = dependencies.concat(this.getActivityDependencies(act))
            i--
        }
    }
    return dependencies
}

NpiSchema.methods.getActivityDependents = function (activity) {
    let directDependentsLabels = global[this.__t == 'oem' ? "OEM_STAGES" : "MACRO_STAGES"]
        .filter(a => a.dep && a.dep.includes(activity.activity)).map(a => a.value)
    let dependents = this.activities.filter(a => directDependentsLabels.includes(a.activity))
    for (let i = 0; i < dependents.length; i++) {
        let act = dependents[i]
        if (!act.apply) {
            dependents.splice(i, 1)
            dependents = dependents.concat(this.getActivityDependents(act))
            i--
        }
    }
    return dependents
}


/*OemSchema.methods.getActivityEndDate = function (activity) {
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
            endDate = new Date(dayZero.valueOf() - (dayZero.valueOf() % DAYS) + activity.term * DAYS)
            console.log(`[npi-oem-model] [activity-end-date] #${this.number} ${activity.activity} Day zero ${dayZero} End Date`, endDate)
        } else {
            let dependenciesEndDatesValues = []
            dependencies.forEach(d => {
                dependenciesEndDatesValues.push(this.getActivityEndDate(d).valueOf())
            })
            endDate = new Date(Math.max(dependenciesEndDatesValues) + activity.term * DAYS)
        }
    }
    
    return endDate
}*/

NpiSchema.methods.getActivityEndDate = function (activity) {
    if (this.stage < 4)
        return null

    var endDate = Date.now()
    var dayZero = new Date(Math.max(...this.critical.map(c => c.signature.date.valueOf())))

    if (activity.closed)
        endDate = activity.signature.date
    else {
        var dependencies = this.getActivityDependencies(activity)
        if (!dependencies || !dependencies.length) {
            endDate = new Date(dayZero.valueOf() + (DAYS - dayZero.valueOf() % DAYS) + activity.term * DAYS)
        } else {
            let dependenciesEndDatesValues = []
            dependencies.forEach(d => {
                dependenciesEndDatesValues.push(this.getActivityEndDate(d).valueOf())
            })
            endDate = new Date(Math.max(dependenciesEndDatesValues) + activity.term * DAYS)
        }
    }
    //console.log(`[npi-model] [activity-end-date] #${this.number} ${this.__t} Result ${activity.activity} End Date`, endDate)
    return endDate
}

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
