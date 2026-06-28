require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate Limiting (prevents brute force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// === DB CONNECTION ===
const { sequelize } = require('./src/models'); // we'll export this next

// === ROUTES (Temporary until Day 2) ===
const authRouter = require('./src/routes/authRoutes'); // we'll create this in a sec
app.use('/api/v1/auth', authRouter);
const profileRoutes = require('./src/routes/profileRoutes');
app.use('/api/v1/profile', profileRoutes);
// Test Route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error Handler (global)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connection established successfully.');

        // Sync DB (force: false preserves existing tables, alter: true updates schema)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized.');

        console.log(`🚀 Server running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
});