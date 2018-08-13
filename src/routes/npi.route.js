var express = require('express')
var router = express.Router()
var authService = require('../services/auth.service');

const npiController = require('../controllers/npi.controller');

router.get('/npi', authService.authorize, npiController.getNpis)
router.get('/npis', authService.authorize, npiController.getNpis)
router.get('/npi/:npiId', authService.authorize, npiController.findNpiById);
router.post('/npi', npiController.createNpi)
router.post('/npis', npiController.createNpi)
router.put('/npi', authService.authorize, npiController.updateNpi)
router.delete('/npi/:npiId', authService.authorize, npiController.removeNpi)

module.exports = router;
