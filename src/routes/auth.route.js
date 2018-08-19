var express = require('express')
var router = express.Router()
var authService = require('../services/auth.service');

const authController = require('../controllers/auth.controller');
var UserController = require('../controllers/user.controller');

router.get('/', authService.authorize, (res)=> res.status(200).send({}));
router.post('/login', authController.authUserByEmailAndPassword);
router.put('/complete-registration/:registerToken', authController.authorizeRegisterToken, UserController.createUser)
router.get('/complete-registration/:registerToken', authController.verifyRegisterToken)
router.get('/forgot/:email', authController.sendResetToken);
router.post('/reset/:resetToken', authController.verifyResetToken, authController.resetPassword);
router.get('/reset/:resetToken', authController.verifyResetToken);

module.exports = router;
