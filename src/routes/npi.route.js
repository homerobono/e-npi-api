var express = require('express')
var router = express.Router()
var authService = require('../services/auth.service');

const npiController = require('../controllers/npi.controller');
var fileController = require('../controllers/file.controller');

router.get('/npi', authService.authorize, npiController.getNpis)
router.get('/npis', authService.authorize, npiController.getNpis)
//router.get('/npi/:npiId', authService.authorize, npiController.findNpiById);
router.get('/npi/:npiNumber', authService.authorize, npiController.findNpiByNumber);
router.post('/npi', authService.authorize, npiController.newNpiVersion)
router.post('/npis', authService.authorize, npiController.createNpi)
router.put('/npi/', authService.authorize, npiController.updateNpi)
router.delete('/npi/:npiId', authService.authorize, npiController.removeNpi)
router.delete('/npis', authService.authorize, npiController.removeAll)

module.exports = router;
