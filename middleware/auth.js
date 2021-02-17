const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const userRepository = require('../repositories/auth');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    else if (req.cookies.token) {
       token = req.cookies.token
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorize to access to this route'), 401);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userIdExists = await userRepository.userExits({ id: decoded.id });

        if (!userIdExists) {
            return next(new ErrorResponse('Not authorize to access to this route'), 401);
        }

        req.userId = decoded.id

        next();
    } catch (err) {
        req.userId = null;
        next();
    }
});