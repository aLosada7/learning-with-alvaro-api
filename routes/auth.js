const express = require('express');
const {
    requestPassword,
    updatePassword,
    createUser,
    confirmEmail,
    login,
    getUser
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
    .get('/user', protect, getUser);

router
    .post('/user', createUser);

router
    .post('/login', login);

router
    .put('/email/confirmation', confirmEmail);

router
    .post('/password/request', requestPassword);

router
    .put('/password/create', updatePassword);

module.exports = router;