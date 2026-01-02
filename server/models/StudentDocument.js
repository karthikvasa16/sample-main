const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentDocument = sequelize.define('StudentDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    documentId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID from the frontend config e.g., pan_card'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Review', 'Verified', 'Rejected'),
        defaultValue: 'Pending'
    }
}, {
    tableName: 'student_documents',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'documentId']
        }
    ]
});

module.exports = StudentDocument;
