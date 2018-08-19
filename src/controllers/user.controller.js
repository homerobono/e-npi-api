// Accessing the Service that we just created
var userDAO = require('../models/DAO/user.dao')
const jwt = require("jsonwebtoken");
let User = require('../models/user.model')
var mailerService = require('../services/mail.service');

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

  exports.createPendingUser = async function(req, res, next){
  // Req.Body contains the form submit values.
    var user = req.body;

    try{
        // Calling the Service function with the new object from the Request Body
        var createdUser = await userDAO.createPendingUser(user)
        await sendRegisterToken(createdUser)
        return res.status(201).send(
          {
            data: createdUser, 
            message: "Usuário criado com sucesso. Um e-mail foi enviado para ' + user.email + ' com instruções para completar o cadastro no sistema."})
    } catch(e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(401).send({message: e.message})
    }
  }
  
  exports.reSendRegisterToken = async function(req, res, next){
    // Req.Body contains the form submit values.
      var user = req.body;
  
      try{
          // Calling the Service function with the new object from the Request Body
          console.log(req.body)
          var updatedUser = await userDAO.updateUser(req.user.data, req.body)
          await sendRegisterToken(updatedUser)
          return res.status(201).send(
            {
              data: updatedUser, 
              message: "Token atualizado com sucesso. Um e-mail foi enviado para ' + user.email + ' com o novo token e as instruções para completar o cadastro no sistema."
            }
          )
          return res.status(200).send({data: updatedUser, message: "Succesfully updated User register token"})
      } catch(e) {
          return res.status(400).send({message: e.message})
      }
    }

exports.createUser = async function(req, res, next){
// Req.Body contains the form submit values.
    var user = req.body;
    console.log(user)

    try{
        // Calling the Service function with the new object from the Request Body
        var createdUser = await userDAO.createUser(user)
        return res.status(201).send({status: 201, data: createdUser, message: "Succesfully created User"})
    } catch(e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(401).send({message: e.message})
    }
}

exports.updateUser = async function(req, res, next){
    console.log(req.body)
    try{
        var updatedUser = await userDAO.updateUser(req.user.data, req.body)
        return res.status(200).send({status: 200, data: updatedUser, message: "Succesfully updated User"})
    }catch(e){
        return res.status(400).send({status: 400., message: e.message})
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

async function sendRegisterToken(user) {
  try {
    var token = user.registerToken
    //let userId = thisUser._id;
  
    console.log(user)
    let result = await mailerService.sendRegisterEmail(user.email, token)
    if (result)
      return result;
    else {
      console.log('Algo deu errado :(')
      throw new Error('Erro ao enviar e-mail de cadastro');
    }
  } catch (err) {
    throw new Error(err)
  }
}

