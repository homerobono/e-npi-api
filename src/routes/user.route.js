var express = require('express')
var router = express.Router()
var authService = require('../services/auth.service');

var UserController = require('../controllers/user.controller');

router.get('/user/', authService.authorize, UserController.getUser)
router.get('/users', authService.authorize, UserController.getUsers)
router.get('/user/:userId', authService.authorize, UserController.findUserById);
router.post('/users', authService.authorize, UserController.createUser)
router.put('/users', authService.authorize, UserController.updateUser)
router.delete('/users/:id', authService.authorize, UserController.removeUser)

module.exports = router;
