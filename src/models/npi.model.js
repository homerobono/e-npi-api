var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
let User = require('./user.model')

var options = { discriminatorKey: String };

var NpiSchema = new mongoose.Schema({
    number: {
        type : Number,
        required : true,
        unique : true
    },
    created: {
        type : Date,
        default: Date.now()
    },
    status : {
        type : String,
        enum : ['Análise Crítica', 'Desenvolvimento', 'Concluído', 'Cancelado'],
        default : 'Análise Crítica'
    },
    npiRef : Number,
    complexity : String,
    annex : String,
    client : String,
    requester : String,
    name : String,
    resources : {
        description : String,
        annex : {
            type : [String]
        }
    },
    regulations : {
        type : [String],
        enum : ['ABNT', 'ANATEL', 'INMETRO', 'ANVISA', 'other'],
    },
    norms : String,
    demand : {
        amount : Number,
        period : {
            type : String,
            enum : ['year','month','day','unique']
        }
    },
    investment : Number,
    fiscals : Number,
    projectCost : {
        value : {
            type : Number,
            //required : true
        },
        annex : [String]
    },
    options
});

NpiSchema.plugin(mongoosePaginate)
const Npi = mongoose.model('Npi', NpiSchema)

module.exports = Npi;
