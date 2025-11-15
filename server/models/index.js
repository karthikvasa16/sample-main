const sequelize = require('../config/database');
const User = require('./User');
const PasswordResetToken = require('./PasswordResetToken');
const EmailVerificationToken = require('./EmailVerificationToken');

// Define associations if needed
// PasswordResetToken.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });

// Export models
module.exports = {
  sequelize,
  User,
  PasswordResetToken,
  EmailVerificationToken
};
