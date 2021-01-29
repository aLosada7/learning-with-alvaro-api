const express = require('express');
const {
    forgotPassword,
    register,
    confirmRegister
} = require('../controllers/auth');

const router = express.Router();

router
    .post('/register', register);

router
    .post('/forgotPassword', forgotPassword);

router
    .post('/confirmRegister', confirmRegister);

module.exports = router;