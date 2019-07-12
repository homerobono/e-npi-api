var async = require('async');
var crypto = require('crypto');
var mailerService = require('../services/mail.service');

var multer = require('multer')
var npiDIR = './npi-files/'
var upload = multer({ dest: npiDIR }).any()

var userDAO = require('../models/DAO/user.dao');
var npiDAO = require('../models/DAO/npi.dao');

exports.getNpi = async (req, res, next) => {
  try {
    let npis = await npiDAO.findNpiById(req.params.npiId);
    console.log(npis);
    res.status(200).send({ data: npis });
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
  }
};

// Async Controller function to get the To do List
exports.getNpis = async function (req, res, next) {
  try {
    var npis = await npiDAO.getNpis({})
    // Return the users list with the appropriate HTTP Status Code and Message.
    return res.status(200).send({ data: npis, message: "Succesfully npi's received" });
  } catch (e) {
    //Return an Error Response Message with Code and the Error Message.
    return res.status(400).send({ message: e.message });
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
    let npis = await npiDAO.findNpiByNumber(req.params.npiNumber);
    res.status(200).send({ data: npis });
  } catch (err) {
    res.status(404).send({
      message: err.message
    });
  }
};

exports.createNpi = async function (req, res, next) {
  var npi = req.body;
  try {
    var createdNpi = await npiDAO.createNpi(req)
    var sentNotify = sendStatusNotify(req, createdNpi)
    return res.status(201).send({ data: createdNpi, message: "Sucessfully Created Npi" })
  } catch (e) {
    console.log({ message: e.message })
    return res.status(401).send({ message: e.message })
  }
}

exports.migrateNpi = async function (req, res, next) {
  var npi = req.body;
  try {
    var migratedNpi = await npiDAO.migrateNpi(req)
    //var sentNotify = sendStatusNotify(req, migratedNpi)
    return res.status(201).send({ data: migratedNpi, message: "Sucessfully Migrated Npi" })
  } catch (e) {
    console.log({ message: e.message })
    return res.status(401).send({ message: e.message })
  }
}

exports.migrateUpdateNpi = async function (req, res, next) {
  try {
    var result = await npiDAO.migrateUpdateNpi(req.user.data, req.body)
    //var sentNotify = sendChangesNotify(req, result)
    console.log("Result", result)
    //scheduleNotifications(req, result)
    //result.sentNotify = sentNotify*/
    return res.status(200).send({ data: result, message: "Sucessfully updated NPI" })
  } catch (e) {
    console.log(e)
    return res.status(400).send({ message: e.message })
  }
}

exports.promoteNpi = async function (req, res, next) {
  try {
    console.log(req.params)
    var result = await npiDAO.promoteNpi(req)
    var sentNotify = sendChangesNotify(req, result)
    console.log(result)
    //result.sentNotify = sentNotify*/
    return res.status(200).send({ data: result, message: "Sucessfully promoted NPI" })
  } catch (e) {
    console.log(e)
    return res.status(403).send({ message: e.message })
  }
}

exports.newNpiVersion = async function (req, res, next) {
  try {
    //console.log(req.body)
    var result = await npiDAO.newNpiVersion(req)
    var sentNotify = sendChangesNotify(req, result)
    console.log(result)
    result.sentNotify = sentNotify
    return res.status(200).send({ data: result, message: "Sucessfully created new NPI version" })
  } catch (e) {
    console.log(e)
    return res.status(403).send({ message: e.message })
  }
}

exports.updateNpi = async function (req, res, next) {
  try {
    var result = await npiDAO.updateNpi(req.user.data, req.body)
    var sentNotify = sendChangesNotify(req, result)
    //console.log(result)
    //result.sentNotify = sentNotify
    return res.status(200).send({ data: result, message: "Sucessfully updated NPI" })
  } catch (e) {
    console.log(e)
    return res.status(400).send({ message: e.message })
  }
}

exports.removeNpi = async function (req, res, next) {
  try {
    let npi = await npiDAO.cancelNpi(req.params.npiId);
    var sentNotify = sendStatusNotify(req, npi)
    res.status(200).send(npi);
  } catch (err) {
    console.log(err)
    res.status(400).send({
      message: err.message
    });
  }
}

exports.removeAll = async function (req, res, next) {
  try {
    let answer = await npiDAO.deleteAllNpis(req.user.data);
    res.status(200).send(answer);
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
  }
}

exports.uploadFiles = async function (req, res, next) {
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

exports.downloadFiles = async function (req, res, next) {
  return res.status(404).send("Bleh");
}

async function sendNewVersionNotify(req, updateResult) {
  var author = req.user.data
  var npi = updateResult.npi

  var users = await userDAO.getUsers({ status: 'active', notify: true })
  console.log(users)
  if (!users || users.length == 0) return "No users to send notifications"

  var changedFields = npiLabelOf(updateResult.changedFields)
  var npiUpdate = { npi, changedFields, authorOfChanges: author }
  //console.log('changedFields')
  //console.log(changedFields)
  try {
    if (changedFields == '' || changedFields == null || !changedFields ||
      changedFields.length == 0 || changedFields == [] ||
      Object.keys(changedFields).length == 0 || changedFields == undefined) {
      console.log("No changes made: emails not sent")
      return "No changes made: emails not sent"
    }
    //let userId = thisUser._id;
    let result = await mailerService.sendNewNpiVersionEmail(users, npiUpdate)
    if (result && result.length > 0) {
      //console.log(result)
      return result;
    } else {
      console.log('Algo deu errado :(')
      throw new Error('Erro ao enviar e-mail de notificação');
    }
  } catch (err) {
    throw Error(err)
  }
}

async function sendStatusNotify(req, npi) {
  var author = req.user.data

  var users = await userDAO.getUsers({ status: 'active', notify: true }, 'email firstName lastName level department')
  console.log(users)
  if (!users || users.length == 0)
    return "No users to send notifications"

  var npiUpdate = {
    npi,
    changedFields: { stage: npi.stage },
    authorOfChanges: author
  }

  try {
    if (!npi) {
      console.log("No changes made: emails not sent")
      return "No changes made: emails not sent"
    }

    var result = await mailerService.sendNpiStatusEmail(users, npiUpdate)

    if (result && result.length > 0) {
      console.log(result)
      return result;
    } else {
      console.log('Algo deu errado :(')
      throw new Error('Erro ao enviar e-mail de notificação');
    }
  } catch (err) {
    throw Error(err)
  }
}

async function sendChangesNotify(req, updateResult) {
  var author = req.user.data
  var npi = updateResult.npi

  var users = await userDAO.getUsers(
    { status: 'active', notify: true },
    '_id email firstName lastName level department'
  )
  var requester = (await userDAO.getUsers({ _id: npi.requester }))
  console.log(`[npi-controller] [changes-notifier] Requester: ${requester[0].email}`)

  //console.log(users)
  if (!users || users.length == 0) return "No users to send notifications"

  var changedFields = npiLabelOf(updateResult.changedFields)
  var npiUpdate = { npi, changedFields, authorOfChanges: author }

  try {
    if (changedFields == '' || changedFields == null || !changedFields ||
      changedFields == [] || changedFields.length == 0 ||
      changedFields == undefined || Object.keys(changedFields).length == 0) {
      console.log("No changes made: emails not sent")
      return "No changes made: emails not sent"
    }
    if (updateResult.changedFields.stage) {
      console.log("[npi-controller] [changes-notifier] Update result:", updateResult)
      var result = await mailerService.sendNpiStatusEmail(users, npiUpdate)
    }
    else if (updateResult.changedFields.critical && updateResult.changedFields.critical.some(analisys => analisys.status == 'deny')) {
      console.log(`[npi-controller] [changes-notifier] [critical-reproval]`, updateResult.changedFields)
      var result = await mailerService.sendNpiCriticalReprovalEmail(requester, npiUpdate)
    }
    else if (updateResult.changedFields.critical && updateResult.changedFields.critical.every(analisys => analisys.status !== undefined && analisys.status == null)) {
      console.log(`[npi-controller] [changes-notifier] [critical-update]`, updateResult.changedFields)
      var result = await mailerService.sendNpiCriticalUpdateEmail(users, npiUpdate)
    }
    else if (updateResult.changedFields.requests) {
      var result = []
      console.log(updateResult.changedFields)
      updateResult.changedFields.requests.forEach(async request => {
        if (request.analisys) {
          if (request.analisys.every(analisys => analisys.status == 'accept' || analisys.status == 'deny')) {
            if (request.analisys.some(analisys => analisys.status == 'deny')) {
              console.log(`[npi-controller] [changes-notifier] [request-reproval]`, updateResult.changedFields)
              let r = await mailerService.sendNpiRequestReprovalEmail(users, npiUpdate, request)
              result.push(r)
            }
            //console.log(`[npi-controller] [changes-notifier] [request-approval]`, updateResult.changedFields)
            //var result = await mailerService.sendNpiCriticalUpdateEmail(users, npiUpdate)
          } else if (request.analisys.every(analisys => analisys.status !== undefined && analisys.status == null)) {
            console.log(`[npi-controller] [changes-notifier] [request-open]`, updateResult.changedFields)
            let r = await mailerService.sendNpiRequestOpenEmail(users, npiUpdate, request)
            result.push(r)
          }
        }
      });
    }
    else {
      console.log("[npi-controller] [changes-notifier] Changes made but not elegible to notifications")
      return "Changes made but not elegible to notifications"
    }
    //var result = await mailerService.sendNpiChangesEmail(users, npiUpdate)

    if (result && result.length > 0) {
      console.log(result)
      return result;
    } else {
      console.log('Algo deu errado :(')
      throw new Error('Erro ao enviar e-mail de notificação');
    }
  } catch (err) {
    throw Error(err)
  }
}

async function scheduleNotifications(req, updateResult) {
  var author = req.user.data
  var npi = updateResult.npi

  var users = await userDAO.getUsers(
    { status: 'active', notify: true },
    'email firstName lastName level department'
  )

  console.log(users)
  if (!users || users.length == 0) return "No users to schedule notifications"

  mailerService.mailScheduler(users, notification, start, period, end)

}

function npiLabelOf(fields) {
  labels = {}
  for (var field in fields) {
    labels[global.NPI_LABELS[field]] = fields[field]
  };
  return labels
}