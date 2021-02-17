const express = require('express');
const {
    newPassword,
    forgotPassword,
    register,
    confirmRegister,
    login,
    getUser
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
    .post('/register', register);

router
    .post('/login', login);

router
    .post('/forgotPassword', forgotPassword);

router
    .post('/confirmRegister', confirmRegister);

router
    .post('/updateForgottenPassword', newPassword);

router
    .get('/getUser', protect, getUser);

module.exports = router;