const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoanApplication = sequelize.define('LoanApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    applicationId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    universityName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    course: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Duration in months'
    },
    purpose: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Review', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    applicantCountry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    applicantIntake: {
        type: DataTypes.STRING,
        allowNull: true
    },
    admissionStatus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    appliedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'loan_applications',
    timestamps: true
});

module.exports = LoanApplication;
