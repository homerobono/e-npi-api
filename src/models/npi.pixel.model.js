var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
let User = require('./user.model')
let Npi = require('./npi.model')

var options = { discriminatorKey: 'kind' };

var PixelNpiSchema = Npi.discriminate(
    'Pixel', 
    new mongoose.Schema({
        cost : {
            type : Number,
            required : true
        },
        price : {
            type : Number,
            required : true
        },
        inStockDate : {
            required : true,
            type : Date
        },
        activities : {
            activityOne : {
                deadline : Date,
                comment : String,
                annex: [File]
            },
            activityTwo : {
                deadline : Date,
                comment : String,
                annex: [File]
            }
        },
        options
    })
);

PixelNpiSchema.plugin(mongoosePaginate)
const PixelNpi = mongoose.model('PixelNpi', PixelNpiSchema)

module.exports = PixelNpi;
