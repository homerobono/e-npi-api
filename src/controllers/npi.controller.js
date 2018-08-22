var async = require('async');
var crypto = require('crypto');
var mailerService = require('../services/mail.service');

var multer = require('multer')
var npiDIR = './npi-files/'
var upload = multer({dest: npiDIR}).any()

var userDAO = require('../models/DAO/user.dao');
var npiDAO = require('../models/DAO/npi.dao');

exports.getNpi = async (req, res, next) => {
    try {
      let npi = await npiDAO.findNpiById(req.params.npiId);
      console.log(npi);
      res.status(200).send(npi);
    } catch (err) {
      res.status(400).send({
        message: err.message
      });
    }
  };


// Async Controller function to get the To do List
exports.getNpis = async function(req, res, next){
    // Check the existence of the query parameters, If the exists doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000; 

    try{
        var npis = await npiDAO.getNpis({}, page, limit)
        // Return the users list with the appropriate HTTP Status Code and Message.
        return res.status(200).send({data: npis, message: "Succesfully npi's received"});
    } catch(e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).send({message: e.message});
    }
}

exports.findNpiById = async (req, res, next) => {
    try {
      let npi = await npiDAO.findNpiById(req.params.npiId);
      res.status(200).send(npi);
    } catch (err) {
      res.status(400).send({
        message: err.message
      });
    }
  };

exports.findNpiByNumber = async (req, res, next) => {
    try {
      let npi = await npiDAO.findNpiByNumber(req.params.npiNumber);
      res.status(200).send(npi);
    } catch (err) {
      res.status(404).send({
        message: err.message
      });
    }
  };

exports.createNpi = async function(req, res, next){
    var npi = req.body;
    try{
        var createdNpi = await npiDAO.createNpi(req)
        return res.status(201).send({data: createdNpi, message: "Succesfully Created Npi"})
    } catch(e) {
        return res.status(401).send({message: e.message})
    }
}

exports.updateNpi = async function(req, res, next){
    try{
        var result = await npiDAO.updateNpi(req.user.data, req.body)
        var sentNotify = sendChangesNotify(req, result)
        //console.log(sentNotify)
        //result.sentNotify = sentNotify*/
        return res.status(200).send({data: result, message: "Succesfully updated NPI"})
    } catch(e){
        return res.status(400).send({message: e.message})
    }
}

exports.removeNpi = async function(req, res, next){
    console.log(req.params)
        try {
          let npi = await npiDAO.deleteNpi(req.params.npiId);
          res.status(200).send(npi);
        } catch (err) {
          res.status(400).send({
            message: err.message
          });
        }
}

exports.uploadFiles = async function(req,res,next){
  var path = '';
     upload(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          console.log(err);
          return res.status(422).send("an error occured while uploading")
        }  
       // No error occured.
        paths = req.files;
        return res.send("Upload completed for " + paths); 
    });     
}

exports.downloadFiles = async function(req,res,next){
  return res.status(404).send("Bleh"); 
}

async function sendChangesNotify(req, updateResult) {
  var author = req.user.data
  var npi = updateResult.npi

  var users = await userDAO.getUsers({status: 'active', notify: true})
  
  var changedFields = npiLabelOf(updateResult.changedFields)
  var npiUpdate = { npi, changedFields, authorOfChanges: author }
  console.log('changedFields')
  console.log(changedFields)
  try {
    if (changedFields == '' || changedFields == null || !changedFields ||
        changedFields.length == 0 || changedFields == [] || 
        Object.keys(changedFields).length == 0 || changedFields == undefined){
          console.log("No changes made: emails not sent")
      return "No changes made: emails not sent"
    }
    //let userId = thisUser._id;
    let result = await mailerService.sendNpiChangesEmail(users, npiUpdate)
    if (result && result.length > 0){
      console.log(result)
      return result;
    } else {
      console.log('Algo deu errado :(')
      throw new Error('Erro ao enviar e-mail de notificação');
    }
  } catch (err) {
    throw new Error(err)
  }
}

function npiLabelOf(fields) {
  labels = {}
  for (var field in fields) {
    labels[global.NPI_LABELS[field]] = fields[field]
  };
  return labels
}