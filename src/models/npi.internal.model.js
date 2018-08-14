var mongoose = require('mongoose')
let Npi = require('./npi.model')

Npi.discriminator(
    'internal', 
    new mongoose.Schema()
);

const InternalNpi = mongoose.model('internal')
module.exports = InternalNpi;
