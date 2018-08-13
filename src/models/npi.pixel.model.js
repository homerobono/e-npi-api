var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
let Npi = require('./npi.model')

var options = { discriminatorKey: 'String' };

var PixelNpiSchema = Npi.discriminator(
    'pixel', 
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
                annex: String
            },
            activityTwo : {
                deadline : Date,
                comment : String,
                annex: String
            }
        },
        options
    })
);

const PixelNpi = mongoose.model('pixel')

module.exports = PixelNpi;
