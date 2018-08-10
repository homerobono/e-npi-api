//var User = require("../models/user.model");
var async = require('async');
var crypto = require('crypto');
var mailerService = require('../services/mail.service');

const authDAO = require("../models/DAO/auth.dao");
var userDAO = require('../models/DAO/user.dao');

exports.authUserByEmailAndPassword = async (req, res, next) => {
  try {
    let data = await authDAO.authUser(req.body);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  console.log('reset req.body: ');
    try {
      let user = await authDAO.verifyResetToken(req.params.resetToken);
      req.body.user = user;  
      console.log('body: ');
      console.log(req.body);
      let result = await authDAO.resetPassword(req.body);
      res.status(200).send({
        success: true,
        user: result
      });
    } catch (err) {
      res.status(400).send({
        message: err.message
      });
    }  
};

exports.verifyResetToken = async (req, res, next) => {
  try{
    console.log(req.params.resetToken);
    let result = await authDAO.verifyResetToken(req.params.resetToken);
    res.status(200).send({
      success: true,
      user: result
    });
  } catch (err){
    res.status(400).send({
      message: err.message
    });
  }
};

exports.sendResetToken = async (req, res, next) => {
  try {
    var token = await crypto.randomBytes(20).toString('hex');
    let thisUser = await userDAO.findUserByEmail(req.params.email)
    console.log(thisUser);

    if (!thisUser) {
      res.status(400).send({ error:'Não existe conta cadastrada com o e-mail '+req.params.email+'.' });
    }
    var userData = 
    {
      resetToken: token, 
      resetExpires: Date.now() + 3600000 //1 hora
    };

    let userId = thisUser._id;

    console.log('saving token in db');
    await userDAO.updateUser(thisUser, {userId: userId, user: userData})
    console.log('saved');
  
    let result = await mailerService.sendResetEmail(req.params.email, token)
    if (result)
      res.status(200).send({message : 
        'Um e-mail foi enviado para ' + req.params.email + ' com instruções para alterar sua senha.'
      });
    else {
      console.log('Algo deu errado')
      res.status(400).send({message: 'Erro ao enviar e-mail'});
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err);
  }
}
