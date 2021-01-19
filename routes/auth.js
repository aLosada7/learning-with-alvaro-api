const express = require('express');
const {
    forgotPassword,
    register
} = require('../controllers/auth');

const router = express.Router();

router
    .post('/register', register);

router
    .post('/forgotPassword', forgotPassword);

module.exports = router;