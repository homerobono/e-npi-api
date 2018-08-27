var mongoose = require('mongoose')
let Npi = require('./npi.model')

var OemSchema = new mongoose.Schema({
    inStockDate : {
        //required : true,
        type : { Date, Number },
        fixed: Date,
        offset: Number
    },
    regulations : {
        type : [ String ],
        enum : ['ABNT', 'ANATEL', 'INMETRO', 'ANVISA', 'other'],
    },        
    demand : {
        amount : Number,
        period : {
            type : String,
            enum : ['year','month','day','unique']
        }
    },
    oemActivities : {
        type: [{
            date : Date,
            comment: String,
            annex: String
        }]
    },
    critical : {
        type: [{
            dept : String,
            status : Boolean,
            comment: String,
            signature: String
        }]
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
