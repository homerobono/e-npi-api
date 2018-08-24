var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var sequence = require('mongoose-sequence')(mongoose);

var options = { discriminatorKey: 'String' };

var NpiSchema = new mongoose.Schema({
    number: {
        type : Number,
        unique : true
    },
    created: {
        type : Date,
        default: Date.now(),
        required: true
    },
    stage : {
        type : Number,
        min : 0,
        max : 4,
        default : 1,
        required: true
    },
    npiRef : Number,
    complexity : {
        type : String,
        //required : true
    },
    annex : String,
    client : {
        type : String,
        default : 'Pixel'
    },
    requester : { 
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name : String,
    resources : {
        description : String,
        annex : {
            type : [String]
        }
    },
    norms : String,
    investment : Number,
    fiscals : Number,
    projectCost : {
        cost : {
            type : Number,
            //required : true
        },
        annex : [String]
    },
    activities : {
        activityOne : {
            deadline : Date,
            comment : String,
            annex: String
        },
        activityTwo : {
            deadline : Date,
            comment : String,
            annex: String
        }
    },
    options
});

NpiSchema.plugin(sequence, {inc_field: 'number'})
NpiSchema.plugin(mongoosePaginate)
const Npi = mongoose.model('Npi', NpiSchema)

module.exports = Npi;
