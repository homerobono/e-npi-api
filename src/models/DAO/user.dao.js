// Gettign the Newly created Mongoose Model we just created 
let User = require('../user.model')
const encrypto = require("../../services/encrypto.service");
var crypto = require('crypto');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the To do List
exports.getUsers = async function(query) {
    try {
        var users = await User.find(query, {})
        return users;
    } catch (e) {
        throw Error('Error while Paginating Users')
    }
}

exports.createPendingUser = async function(data){
    let token = await crypto.randomBytes(20).toString('hex');

    data.registerToken = token, 
    data.registerExpires = Date.now() + 3600000*24*30 //30 dias
    data.status = 'pending'

    console.log('saving register token in db');
    console.log(data)
    try{
        let newUser = await User.create(data);
        console.log('saved: '+newUser)
        return newUser;
    } catch(e) {
        console.log(e)
        throw Error(e)
    }
}

exports.createAdmin = async function(data){
    try{
        let newUser = await User.create(data);
        console.log('saved: '+newUser)
        newUser.password=null
        return newUser;
    } catch(e) {
        console.log(e)
        throw Error(e)
    }
}

exports.createUser = async function(data){
    try{
        console.log(data)
        var pendingUser = await User.findById(data.userId);
    } catch(e) {
        throw Error("Error occured while finding the pending user")
    }
    if(!pendingUser){
        throw Error("Usuário não encontrado")
    }

    pendingUser.firstName = data.firstName
    pendingUser.lastName = data.lastName
    pendingUser.phone = data.phone
    pendingUser.status = 'active'
    pendingUser.registerToken = null
    pendingUser.registerExpires = Date.now()
    pendingUser.created = Date.now();
    pendingUser.password = data.newPassword;

    console.log(data)
    try{
        // Saving the User
        let newUser = await pendingUser.save();
        console.log('saved: '+newUser)
        newUser.password = null
        return newUser;
    } catch(e) {
        console.log(e)
        throw Error(e)
    }
}

exports.updateUser = async function(thisUser, data){
    try{
        var oldUser = await User.findById(data.userId);
    } catch(e) {
        throw Error("Error occured while finding the user")
    }
    
    // If no old User Object exists return false
    if(!oldUser){
        throw Error("Usuário não encontrado")
    }

    if (data.user) {
        if (data.user.password) {
            let oldPasswordEnc = await encrypto.encryptData(data.user.password);
            if(oldPasswordEnc!=oldUser.password) throw Error("Senha incorreta")
            data.user.password = data.user.newPassword
        }
        
        for (var prop in data.user) {
            if (oldUser[prop]!=null) {
                console.log('setting '+prop+', from '+oldUser[prop]+' to '+data.user[prop]);
                oldUser[prop] = data.user[prop];
            }
        }
    }

    if (oldUser.status == 'pending') {
        let token = await crypto.randomBytes(20).toString('hex');
        oldUser.registerToken = token, 
        oldUser.registerExpires = Date.now() + 3600000*24*30 //30 dias
    }

    try{
        var savedUser = await oldUser.save();
        console.log(savedUser);
        savedUser.password = null
        return savedUser;
    }catch(e){
        throw Error("An error occured while updating the User");
    }
}

exports.deleteUser = async function(id){
    
    // Delete the User
    try{
        var deleted = await User.remove({_id: id})
        if(deleted.result.n === 0){
            throw Error("User Could not be deleted")
        }
        return deleted
    }catch(e){
        throw Error("Error Occured while Deleting the User")
    }
}

exports.findUserById = async userId => 
    { 
        let user = await User.findById(userId);
        if (user) {
            user.password = null
            user.resetToken = null
        }
        return user
    }

exports.findUserByEmail = async userEmail => 
    { 
        let user = await User.findOne({email : userEmail})
        if (user) {
            user.password = null
            user.resetToken = null
        }
        return user
    }
