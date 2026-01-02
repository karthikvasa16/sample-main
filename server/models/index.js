const sequelize = require('../config/database');
const User = require('./User');
const PasswordResetToken = require('./PasswordResetToken');
const EmailVerificationToken = require('./EmailVerificationToken');
const AccountActivityLog = require('./AccountActivityLog');
const StudentLead = require('./StudentLead');

const LoanApplication = require('./LoanApplication');
const StudentDocument = require('./StudentDocument');

// Define associations if needed
// PasswordResetToken.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });
User.hasMany(LoanApplication, { foreignKey: 'userId', as: 'loanApplications' });
LoanApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(StudentDocument, { foreignKey: 'userId', as: 'documents' });
StudentDocument.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export models
module.exports = {
  sequelize,
  User,
  PasswordResetToken,
  EmailVerificationToken,
  AccountActivityLog,
  StudentLead,
  LoanApplication,
  StudentDocument
};
