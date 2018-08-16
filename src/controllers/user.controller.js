// Accessing the Service that we just created
var userDAO = require('../models/DAO/user.dao')
const jwt = require("jsonwebtoken");
let User = require('../models/user.model')

// Saving the context of this module inside the _the variable
_this = this

exports.getUser = async (req, res, next) => {
    let id = req.user.data._id;
    try {
      let user = await userDAO.findUserById(id);
      console.log(user);
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send({
        message: err.message
      });
    }
  };

exports.getUsers = async function(req, res, next){
    try{
        var users = await userDAO.getUsers({})//, page, limit)
        return res.status(200).send({data: users, message: "Succesfully users received"});
    } catch(e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).send({message: e.message});
    }
}

exports.findUserById = async (req, res, next) => {
    try {
      let user = await userDAO.findUserById(req.params.userId);
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send({
        message: err.message
      });
    }
  };

  exports.findUserByEmail = async (req, res, next) => {
    try {
      let user = await userDAO.findUserByEmail(req.params.email);
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send({
        message: err.message
      });
    }
  };

exports.createUser = async function(req, res, next){
// Req.Body contains the form submit values.
    var user = req.body;

    try{
        // Calling the Service function with the new object from the Request Body
        var createdUser = await userDAO.createUser(user)
        return res.status(201).json({status: 201, data: createdUser, message: "Succesfully Created User"})
    } catch(e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(401).send({message: e.message})
    }
}

exports.updateUser = async function(req, res, next){
    console.log(req.body)
    try{
        var updatedUser = await userDAO.updateUser(req.user.data, req.body)
        return res.status(200).json({status: 200, data: updatedUser, message: "Succesfully Updated User"})
    }catch(e){
        return res.status(400).json({status: 400., message: e.message})
    }
}

exports.removeUser = async function(req, res, next){
    console.log(req.params)
    if (req.user.data.level > 0) {
        try {
          let user = await userDAO.deleteUser(req.params.id);
          res.status(200).send(user);
        } catch (err) {
          res.status(200).send({
            message: err.message
          });
        }
      } else {
        res.status(401).send({
          message: "Permissão negada."
        });
      }
}
