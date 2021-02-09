const express = require('express');
const {
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

module.exports = router;