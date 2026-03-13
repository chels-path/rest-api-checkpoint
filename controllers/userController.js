// controllers/userController.js
// This file contains all the business logic for user operations

const User = require('../models/User');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Public
 */
const getAllUsers = async (req, res) => {
    try {
        // Extract query parameters for filtering
        const { role, isActive, sortBy = 'createdAt', order = 'desc', limit = 10, page = 1 } = req.query;
        
        // Build filter object
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sortOrder = order === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };
        
        // Execute query with pagination and filtering
        const users = await User.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip)
            .select('-password'); // Exclude password from results
        
        // Get total count for pagination
        const totalUsers = await User.countDocuments(filter);
        
        // Send response with metadata
        res.status(200).json({
            success: true,
            count: users.length,
            total: totalUsers,
            page: parseInt(page),
            pages: Math.ceil(totalUsers / parseInt(limit)),
            data: users
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Public
 */
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, age, password, role, phoneNumber, address } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            age,
            password, // In production, password would be hashed
            role,
            phoneNumber,
            address
        });
        
        // Save user to database
        await user.save();
        
        // Remove password from response
        const userResponse = user.toJSON();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errors
            });
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered',
                field: Object.keys(error.keyPattern)[0]
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Public
 */
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, age, role, phoneNumber, address, isActive } = req.body;
        
        // Find user and update
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                firstName,
                lastName,
                age,
                role,
                phoneNumber,
                address,
                isActive,
                updatedAt: Date.now()
            },
            {
                new: true, // Return the updated document
                runValidators: true // Run schema validators
            }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @access  Public
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: {}
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Update user partially (PATCH)
 * @route   PATCH /api/users/:id
 * @access  Public
 */
const patchUser = async (req, res) => {
    try {
        const updates = req.body;
        
        // Find user and update only provided fields
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User patched successfully',
            data: user
        });
    } catch (error) {
        console.error('Error in patchUser:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Get users by role
 * @route   GET /api/users/role/:role
 * @access  Public
 */
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.find({ role }).select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error in getUsersByRole:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Search users by name
 * @route   GET /api/users/search
 * @access  Public
 */
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        // Search by first name or last name (case-insensitive)
        const users = await User.find({
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error in searchUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    patchUser,
    getUsersByRole,
    searchUsers
};
