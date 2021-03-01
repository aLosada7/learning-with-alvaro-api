const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmailToUser = require('../utils/sendEmail');
const userRepository = require('../repositories/auth');

// @desc Get own user
// @route GET /api/v1/auth/user
// @access Public
exports.getUser = async(req, res, next) => {
    const id = req.userId;

    if(!id) {
        return next(new ErrorResponse(`ERROR.AUTH.USER-NOT-FOUND`, 401));
    }

    const user = await userRepository.getUser({
        attributes: ['id', 'email', 'name', 'lastName'],
        where: { id }
    })

    if (!user) {
        return next(new ErrorResponse(`ERROR.AUTH.USER-NOT-FOUND`, 401));
    }

    res.status(200).json(user);
}

// @desc Create new user
// @route POST /api/v1/auth/user
// @access Public
exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, lastName, email, password, sendEmail } = req.body;

    const doesEmailExists = await emailExists(email);

    if (doesEmailExists) {
        return next(new ErrorResponse(`ERROR.AUTH.REGISTER.EMAIL-ALREADY-EXISTS`, 401));
    }

    const validationToken = jwt.sign({ id: email }, process.env.JWT_SECRET, {});

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await userRepository.createUser({
        name,
        lastName,
        email,
        password: hashedPassword,
        validationToken,
        emailConfirmed: false
    });

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

        res.status(201).json(user)
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

    const user = await userRepository.getUser({
        attributes: ['id', 'email', 'password', 'emailConfirmed'],
        where: { email } 
    })

    if (!user) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.EMAIL-DOES-NOT-EXISTS`, 401));
    }

    // Check if email is confirmed
    if(!user.emailConfirmed) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.REGISTER-NOT-COMPLETE`, 401));
    }

    // Check if password matches
    const isMatch =  await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new ErrorResponse(`ERROR.AUTH.LOGIN.INVALID-CREDENTIALS`, 401));
    }

    sendTokenResponse(user, 200, res)
});

const emailExists = async (email) => {
    const userExists = await userRepository.userExits({ email });
    return userExists > 0;
}

// @desc Confirm register
// @route POST /api/v1/auth/email/confirmation
// @access Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
    let token = req.query.evldr;

    const user = await userRepository.getUser({ 
        attributes: ['validationToken'],
        where: { validationToken: token } 
    });

    if (!user) {
        return next(new ErrorResponse(`ERROR.SOMETHING-WENT-WRONG`, 401));
    }

    const userUpdated = await userRepository.updateUser({ 
        attributes: { emailConfirmed: true },
        where: { validationToken: user.validationToken } 
    });
    
    if (!userUpdated) {
        return next(new ErrorResponse(`ERROR.SOMETHING-WENT-WRONG`, 500));
    }

    res.status(200).json({ success: true })
});

// @desc Forgot password
// @route POST /api/v1/auth/password/request
// @access Public
exports.requestPassword = asyncHandler(async (req, res, next) => {
    const { email, sendEmail } = req.body;

    const doesEmailExists = await emailExists(email);

    if (!doesEmailExists) {
        return next(new ErrorResponse(`ERROR.AUTH.FORGOT-PASSWORD.EMAIL-DOES-NOT-EXISTS`, 401));
    }
    const newPasswordToken = jwt.sign({ id: email }, process.env.JWT_SECRET, {});

    const userUpdated = await userRepository.updateUser({ 
        attributes: { newPasswordToken },
        where: { email } 
    });

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

        res.status(200).json({ newPasswordToken });
    } catch (err) {
        return next(new ErrorResponse('ERROR.EMAIL-NOT-SENT', 500));
    }
});

// @desc Update a password
// @route POST /api/v1/auth/password/create
// @access Public
exports.updatePassword = asyncHandler(async(req, res, next) => {
    let token = req.query.pvldr;
    const { password } = req.body;

    const user = await userRepository.getUser({ 
        attributes: ['password', 'newPasswordToken'],
        where: { newPasswordToken: token } 
    });

    if (!user) {
        return next(new ErrorResponse(`ERROR.AUTH.FORGOT-PASSWORD.UPDATE-PASSWORD`, 401));
    }

    console.log(password);

    const hashedPassword = await bcrypt.hash(password, 8);

    console.log(hashedPassword);

    const userUpdated = await userRepository.updateUser({ 
        attributes: { password: hashedPassword, newPasswordToken: null },
        where: {
            newPasswordToken: token
        }
    });

    if (!userUpdated) {
        return next(new ErrorResponse(`ERROR.SOMETHING-WENT-WRONG`, 500));
    }

    res.status(200).json({ success: true });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {});

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
            token
        })
};

