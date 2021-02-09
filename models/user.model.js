module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        name: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        validationToken: {
            type: Sequelize.STRING
        },
        emailConfirmed: {
            type: Sequelize.BOOLEAN
        },
        newPasswordToken: {
            type: Sequelize.STRING
        },
    });
    
    return User;
  };