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
    },
    firstName: {
        type: String,
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
    registerToken: {
        type: String,
        default: ''
    },
    registerExpires: {
        type: Date,
        default: Date.now() + 3600000*24*30
    },
    resetToken: {
        type: String,
        default: ''
    },
    resetExpires: {
        type: Date,
        default: Date.now() + 3600000
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'disabled']
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
