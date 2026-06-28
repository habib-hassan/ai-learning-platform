const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const StudentProfile = sequelize.define('StudentProfile', {
        ProfileId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // One-to-one with User
        },
        Institution: DataTypes.STRING(255),
        Major: DataTypes.STRING(255),
        YearOfStudy: DataTypes.INTEGER,
        StudyStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        TotalStudyMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        PreferredDifficulty: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner',
        },
    }, {
        tableName: 'studentprofiles',
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
    });

    StudentProfile.associate = function (models) {
        StudentProfile.belongsTo(models.User, { foreignKey: 'UserId' });
    };

    return StudentProfile;
};