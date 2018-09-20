var express = require('express')
var router = express.Router()
var authService = require('../services/auth.service');

var fileController = require('../controllers/file.controller');

/*
router.post('/npi/:npiId/', authService.authorize, npiController.uploadFiles);
router.get('/npi/:npiId/', authService.authorize, npiController.downloadFiles);
router.post('/files/', authService.authorize, npiController.uploadFiles);
router.get('/files/', authService.authorize, npiController.downloadFiles);
*/
router.post('/files/list', authService.authorize, fileController.list)
router.get('/files/download', authService.authorize, fileController.download)
router.post('/files/upload', authService.authorize, fileController.upload)
router.post('/files/remove', authService.authorize, fileController.remove)
router.post('/files/createFolder', authService.authorize, fileController.createFolder)
router.post('/files/rename', authService.authorize, fileController.rename)
router.post('/files/move', authService.authorize, fileController.move)
router.post('/files/copy', authService.authorize, fileController.copy)

module.exports = router;
