//const crypto = require('crypto');
var jwt = require("jsonwebtoken");
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require("../models");
const sendEmailToUser = require('../utils/sendEmail');
const User = db.users;
const Op = db.Sequelize.Op;

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, lastName, email, password, sendEmail } = req.body;

    const doesEmailExists = await emailExists(email);

    if (doesEmailExists) {
        return next(new ErrorResponse(`ERROR.AUTH.REGISTER.EMAIL-ALREADY-EXISTS`, 401));
    }

    const validationToken = jwt.sign({ id: email }, process.env.SECRET, {});

    const user = await User.create({
        name,
        lastName,
        email,
        password,
        validationToken,
        emailConfirmed: false
    })

    if (!user) {
        return next(new ErrorResponse(`ERROR.AUTH.REGISTER.ERROR-OCURRED`, 500));
    }

    try {
        if (!sendEmail || sendEmail !== "no") {
            await sendEmailToUser({
                to: user.email,
                subject : "Register confirmation",
                text: "Register confirmation",
                template: 'emailConfirmation',
                context: { name: user.name, validationToken }
            });
        }

        res.status(200).json({ success: true, data: user })
    } catch (err) {
        // delete user
        return next(new ErrorResponse('ERROR.EMAIL-NOT-SENT', 500));
    }
    
});


// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide an email and a password`, 400));
    }

    const user = await User.findOne({ 
        attributes: ['id', 'email', 'password', 'emailConfirmed'],
        where: { email } 
    });

    if (!user) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.EMAIL-DOES-NOT-EXISTS`, 401));
    }

    // Check if email is confirmed
    if(!user.emailConfirmed) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.REGISTER-NOT-COMPLETE`, 401));
    }

    // Check if password matches
    const isMatch =  user.password === password;

    if (!isMatch) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.INVALID-CREDENTIALS`, 401));
    }

    sendTokenResponse(user, 200, res)
});

const emailExists = async (email) => {
    const userExists = await User.count({ where: { email } });
    return userExists > 0;
}

// @desc Confirm register
// @route POST /api/v1/confirmRegister
// @access Public
exports.confirmRegister = async (req, res, next) => {
    let token = req.query.evldr;

    const user = await User.findOne({ 
        attributes: ['validationToken'],
        where: { validationToken: token } 
    });

    if (!user) {
        return next(new ErrorResponse(`ERROR.SOMETHING-WENT-WRONG`, 401));
    }

    const userUpdated = await User.update({ emailConfirmed: true }, {
        where: {
            validationToken: user.validationToken
        }
    })
    
    if (!userUpdated) {
        return next(new ErrorResponse(`ERROR.SOMETHING-WENT-WRONG`, 500));
    }

    res.status(200).json({ success: true })
};

// @desc Forgot password
// @route POST /api/v1/forgotPassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email, sendEmail } = req.body;

    const doesEmailExists = await emailExists(email);

    if (!doesEmailExists) {
        return next(new ErrorResponse(`ERROR.AUTH.FORGOT-PASSWORD.EMAIL-DOES-NOT-EXISTS`, 401));
    }
    const newPasswordToken = jwt.sign({ id: email }, process.env.SECRET, {});

    const userUpdated = await User.update({ newPasswordToken }, {
        where: {
            email
        }
    })

    if (!userUpdated) {
        return next(new ErrorResponse(`ERROR.SOMETHING-WENT-WRONG`, 500));
    }

    try {
        if (sendEmail !== "no") {
            await sendEmailToUser({
                to: email,
                subject : "Request a new password",
                text: "Request a new password",
                template: 'passwordForgotten',
                context: { newPasswordToken }
            });
        }

        res.status(200).json({ success: true, data: { newPasswordToken } });
    } catch (err) {
        return next(new ErrorResponse('ERROR.EMAIL-NOT-SENT', 500));
    }
});

// @desc Update forgottenpassword
// @route POST /api/v1/updateForgottenPassword
// @access Public
exports.updateForgottenPassword = async (req, res, next) => {
    let token = req.query.pvldr;
    const { password } = req.body;

    const user = await User.findOne({ 
        attributes: ['newPasswordToken'],
        where: { newPasswordToken: token } 
    });

    if (!user) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.UPDATE-PASSWORD-ERROR`, 401));
    }

    const userUpdated = await User.update({ password }, {
        where: {
            newPasswordToken: user.newPasswordToken
        }
    })

    if (!userUpdated) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.UPDATE-PASSWORD-ERROR`, 401));
    }

    res.status(200).json({ success: true })
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    var token = jwt.sign({ id: user.id }, process.env.SECRET, {});

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV == 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
};

