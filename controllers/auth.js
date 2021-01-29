const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require("../models");
const sendEmail = require('../utils/sendEmail');
const User = db.users;
const Op = db.Sequelize.Op;

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, lastName, email, password, role } = req.body;

    if (await emailExists(email)) {
        return next(new ErrorResponse(`Email already exists.`, 401));
    }

    const user = await User.create({
        name,
        lastName,
        email,
        password,
        emailConfirmed: false
    })

    if (!user) {
        return next(new ErrorResponse(`Some error ocurred registering the new user`, 500));
    }

    try {
        await sendEmail({
            to: user.email,
            subject : "Register confirmation",
            text: "Register confirmation",
            template: 'emailConfirmation',
            context: { name: user.name }
        });

        res.status(200).json({ success: true, data: user })
    } catch (err) {
        console.log(err)
        // delete user
        return next(new ErrorResponse(' Email could not be sent', 500));
    }
    
});

const emailExists = async (email) => {
    const userExists = await User.count({ where: { email } });
    return userExists > 0;
}

// @desc Forgot password
// @route POST /api/v1/forgotPassword
// @access Public
exports.forgotPassword = () => {
    return true;
};

// @desc Confirm register
// @route POST /api/v1/confirmRegister
// @access Public
exports.confirmRegister = async (req, res, next) => {
    let email = req.query.email;

    const userUpdated = await User.update({ emailConfirmed: true }, {
        where: {
            email
        }
    })

    if (!userUpdated) {
        return next(new ErrorResponse(`Some error ocurred confirming the register`, 500));
    }

    res.status(200).json({ success: true })
};

