const express = require('express');
const {
    updateForgottenPassword,
    forgotPassword,
    register,
    confirmRegister,
    login
} = require('../controllers/auth');

const router = express.Router();

router
    .post('/register', register);

router
    .post('/login', login);

router
    .post('/forgotPassword', forgotPassword);

router
    .post('/confirmRegister', confirmRegister);

router
    .post('/updateForgottenPassword', updateForgottenPassword);

module.exports = router;