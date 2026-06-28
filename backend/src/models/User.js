const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        UserId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        Email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        PasswordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        FullName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        Role: {
            type: DataTypes.ENUM('student', 'instructor', 'admin'),
            defaultValue: 'student',
        },
        AvatarUrl: DataTypes.STRING(500),
        Bio: DataTypes.TEXT,
        CareerGoal: DataTypes.STRING(500),
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        LastLogin: DataTypes.DATE,
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: false, // We only have CreatedAt in schema, no UpdatedAt on users
        hooks: {
            beforeCreate: async (user) => {
                if (user.PasswordHash) {
                    const salt = await bcrypt.genSalt(10);
                    user.PasswordHash = await bcrypt.hash(user.PasswordHash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('PasswordHash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.PasswordHash = await bcrypt.hash(user.PasswordHash, salt);
                }
            }
        }
    });

    // Instance method to check password
    User.prototype.validPassword = async function (password) {
        return await bcrypt.compare(password, this.PasswordHash);
    };

    // Association placeholder (we will link others here on Day 2)
    User.associate = function (models) {
        User.hasOne(models.StudentProfile, {
            foreignKey: 'UserId',
            onDelete: 'CASCADE'
        });
        // We'll add more associations later (Roadmaps, Notes, etc.)
    };

    return User;
};