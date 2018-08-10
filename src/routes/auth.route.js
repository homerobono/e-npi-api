var express = require('express')
var router = express.Router()
var authService = require('../services/auth.service');

const authController = require('../controllers/auth.controller');

router.get('/', authService.authorize, (res)=> res.status(200).send({}));
router.post('/login', authController.authUserByEmailAndPassword);
router.get('/forgot/:email', authController.sendResetToken);
router.post('/reset/:resetToken', authController.resetPassword);
router.get('/reset/:resetToken', authController.verifyResetToken);

module.exports = router;
