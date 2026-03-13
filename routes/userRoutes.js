// routes/userRoutes.js
// This file defines all API routes for user operations

const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    patchUser,
    getUsersByRole,
    searchUsers
} = require('../controllers/userController');

/**
 * @route   GET /api/users/search
 * @desc    Search users by name/email
 * @access  Public
 */
router.get('/search', searchUsers);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role
 * @access  Public
 */
router.get('/role/:role', getUsersByRole);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.route('/')
    .get(getAllUsers)
    .post(createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @route   PUT /api/users/:id
 * @desc    Update user completely
 * @route   PATCH /api/users/:id
 * @desc    Update user partially
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .patch(patchUser)
    .delete(deleteUser);

module.exports = router;
