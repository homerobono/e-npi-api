var mongoose = require('mongoose')
let Npi = require('./npi.model')

let InternalSchema = new mongoose.Schema({
    inStockDate: {
        type: Date,
        default: null
    },
})

InternalSchema.methods.getActivityEndDate = function (activity) {
    if (this.stage < 4)
        return null

    var endDate = Date.now()
    var dayZero = new Date(Math.max(this.critical.map(c => c.signature.date.valueOf())))

    if (activity.closed)
        endDate = activity.signature.date
    else {
        var dependencies = this.getActivityDependencies(activity)
        if (!dependencies || !dependencies.length) {
            endDate = new Date(dayZero.valueOf() + activity.term * DAYS)
        } else {
            let dependenciesEndDatesValues = []
            dependencies.forEach(d => {
                dependenciesEndDatesValues.push(this.getActivityEndDate(d).valueOf())
            })
            endDate = new Date(Math.max(dependenciesEndDatesValues))
        }
    }
    console.log("[oem-model] [activity-end-date] Result End Date", endDate)
    return endDate
}

Npi.discriminator(
    'internal', 
    InternalSchema
    );

const InternalNpi = mongoose.model('internal')
module.exports = InternalNpi;
