// Gettign the Newly created Mongoose Model we just created 
let User = require('../user.model')
const encrypto = require("../../services/encrypto.service");

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

exports.createUser = async function(data){
    
    data.created = Date.now();
    data.password = data.newPassword;
    console.log(data)
    try{
        // Saving the User
        let newUser = await User.create(data);
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

    if (data.user.password) {
        let oldPasswordEnc = await encrypto.encryptData(data.user.password);
        if(oldPasswordEnc!=oldUser.password) throw Error("Wrong password")
        data.user.password = data.user.newPassword
    }
    
    for (var prop in data.user) {
        if (oldUser[prop]!=null) {
            console.log('setting '+prop+', from '+oldUser[prop]+' to '+data.user[prop]);
            oldUser[prop] = data.user[prop];
        }
    }

    try{
        var savedUser = await oldUser.save();
        console.log(savedUser);
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
    await User.findById(userId);

exports.findUserByEmail = async userEmail => 
    await User.findOne({email : userEmail});
