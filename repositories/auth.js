const db = require("../models");
const User = db.users;

exports.createUser = async(user) => {
    return await User.create(user)
}

// object first argument => what columns do you want to obtain
// object second argument => where clause
exports.getUser = async(user) => {
    return await User.findOne({ 
        attributes: user.attributes,
        where: user.where
    });
}

exports.updateUser = async(user) => {
    return await User.update(user.attributes, {
        where: user.where
    })
}

exports.userExits = async(condition) => {
    return await User.count({ where: condition });
}