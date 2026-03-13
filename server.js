// server.js
// Main application file - Entry point for the REST API

require('dotenv').config({ path: './config/.env' }); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Body parser middleware - parse JSON request bodies
app.use(express.json());

// Body parser middleware - parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Logging middleware for development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// CORS middleware (allow cross-origin requests)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    next();
});

// ============================================
// DATABASE CONNECTION
// ============================================

/**
 * Connect to MongoDB with error handling
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Exit process with failure
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// ============================================
// ROUTES
// ============================================

// Root route - API information
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'REST API is running',
        version: '1.0.0',
        endpoints: {
            users: {
                getAll: 'GET /api/users',
                getOne: 'GET /api/users/:id',
                create: 'POST /api/users',
                update: 'PUT /api/users/:id',
                patch: 'PATCH /api/users/:id',
                delete: 'DELETE /api/users/:id',
                search: 'GET /api/users/search?q=term',
                byRole: 'GET /api/users/role/:role'
            }
        },
        documentation: 'Use Postman to test all endpoints',
        workingHours: 'Monday to Friday, 9:00 to 17:00'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Mount user routes
app.use('/api/users', userRoutes);

// Handle 404 - Route not found
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
        suggestion: 'Check the available endpoints at /'
    });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('❌ UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('💤 Process terminated!');
    });
});

module.exports = app; // For testing purposes
