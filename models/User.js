// models/User.js
// This file defines the User schema and model for MongoDB

const mongoose = require('mongoose');

/**
 * User Schema Definition
 * Defines the structure and validation rules for User documents
 */
const userSchema = new mongoose.Schema({
    // First Name field - required string with validation
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true, // Removes whitespace from both ends
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [50, 'First name cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s-]+$/, 'First name can only contain letters, spaces, and hyphens']
    },
    
    // Last Name field - required string with validation
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [50, 'Last name cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s-]+$/, 'Last name can only contain letters, spaces, and hyphens']
    },
    
    // Email field - required, unique, with email validation
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures no duplicate emails
        lowercase: true, // Converts email to lowercase
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    
    // Age field - optional number with validation
    age: {
        type: Number,
        min: [18, 'User must be at least 18 years old'],
        max: [120, 'Age cannot exceed 120'],
        validate: {
            validator: Number.isInteger,
            message: 'Age must be an integer'
        }
    },
    
    // Password field (in real apps, you'd hash this)
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't return password by default in queries
    },
    
    // Role field with enum validation
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'moderator'],
            message: '{VALUE} is not a valid role'
        },
        default: 'user'
    },
    
    // Status field - active/inactive
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Profile picture URL
    profilePicture: {
        type: String,
        default: 'default-avatar.png'
    },
    
    // Phone number with validation
    phoneNumber: {
        type: String,
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please provide a valid phone number']
    },
    
    // Address fields
    address: {
        street: String,
        city: String,
        country: String,
        zipCode: String
    },
    
    // Timestamps - when user was created/updated
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Virtual for full name
 * Virtuals are document properties that you can get and set but are not persisted to MongoDB
 */
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

/**
 * Pre-save middleware to hash password (example)
 * In a real app, you'd hash the password before saving
 */
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // In a real app: this.password = await bcrypt.hash(this.password, 10);
        console.log('Password would be hashed here in production');
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method to compare passwords (example)
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    // In a real app: return await bcrypt.compare(candidatePassword, this.password);
    return candidatePassword === this.password; // Simplified for demo
};

/**
 * Static method to find active users
 */
userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true });
};

/**
 * Static method to find by email
 */
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

/**
 * Query helper to filter by role
 */
userSchema.query.byRole = function(role) {
    return this.where({ role: role });
};

/**
 * Transform the returned document
 * Removes sensitive information when converting to JSON
 */
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password; // Remove password from JSON output
        delete ret.__v; // Remove version key
        return ret;
    }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
