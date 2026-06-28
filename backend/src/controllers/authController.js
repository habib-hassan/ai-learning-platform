const jwt = require('jsonwebtoken');
const { User } = require('../models'); // We'll export models from index later

exports.register = async (req, res) => {
    try {
        const { Email, PasswordHash, FullName, Role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create user (password auto-hashed by model hook)
        const user = await User.create({
            Email,
            PasswordHash, // plain text passed, hook handles hashing
            FullName,
            Role: Role || 'student'
        });

        // Generate JWT
        const token = jwt.sign(
            { UserId: user.UserId, Email: user.Email, Role: user.Role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                UserId: user.UserId,
                Email: user.Email,
                FullName: user.FullName,
                Role: user.Role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const user = await User.findOne({ where: { Email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await user.validPassword(Password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await user.update({ LastLogin: new Date() });

        const token = jwt.sign(
            { UserId: user.UserId, Email: user.Email, Role: user.Role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                UserId: user.UserId,
                Email: user.Email,
                FullName: user.FullName,
                Role: user.Role,
                IsActive: user.IsActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};