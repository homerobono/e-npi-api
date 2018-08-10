// Gettign the Newly created Mongoose Model we just created 
let User = require('../models/user.model')
const encrypto = require("../services/encrypto.service");

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the To do List
exports.getUsers = async function(query){ //, page, limit){

    // Options setup for the mongoose paginate
    var options = {
        //page,
        //limit
    }
    
    // Try Catch the awaited promise to handle the error    
    try {
        //var users = await User.paginate(query, options)
        var users = await User.find(query, options)
        
        // Return the userd list that was retured by the mongoose promise
        return users;

    } catch (e) {

        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.createUser = async function(data){
    
    // Creating a new Mongoose Object by using the new keyword
    //data.password = await encryptoService.encryptData(data.password);
    data.created = Date.now();
    data.password = data.newPassword;
    console.log(data)
    try{
        // Saving the User
        let newUser = await User.create(data);
        //var savedUser = await newUser.save()
        console.log('saved: '+newUser)
        return newUser;
    } catch(e) {
        console.log(e)
        // return a Error message describing the reason     
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

exports.findUserByEmail = async data => 
    await User.findOne({email : data.userEmail});
