const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (await emailExists(email)) {
        return next(new ErrorResponse(`Email already exists`, 401));
    }

    const user = await User.create({
        email,
        password,
    })

    if (!user) {
        return next(new ErrorResponse(`Some error ocurred registering the new user`, 500));
    }
    
    res.send({
        success: true,
        data: user
    });
    
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

