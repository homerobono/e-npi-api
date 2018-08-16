var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
let encryptoService = require('../services/encrypto.service')

var UserSchema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: String,
    department: String,
    phone: String,
    level: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now()
    },
    status: String,
    lastUpdate: Date,
    resetToken: {
        type: String,
        default: ''
    },
    resetExpires: {
        type: Date,
        default: Date.now() + 3600000
    }
});

UserSchema.pre('save', async function (next) { 
    if (!this.isModified('password')) return next();
    try { 
        console.log('senha: '+this.password);
        let password = await encryptoService.encryptData(this.password);
        this.password = password;
        console.log('enc senha: '+this.password);
    } catch(e) {
        next(e)
    }
    return next();
});

//UserSchema.plugin(mongoosePaginate)
UserSchema.plugin(uniqueValidator);
const User = mongoose.model('User', UserSchema)

module.exports = User;
