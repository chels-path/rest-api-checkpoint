// seed.js
// Script to populate database with sample users

require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const sampleUsers = [
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: 28,
        password: 'password123',
        role: 'user',
        phoneNumber: '+1234567890',
        address: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zipCode: '10001'
        }
    },
    {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        age: 32,
        password: 'password123',
        role: 'admin',
        phoneNumber: '+0987654321',
        address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            country: 'USA',
            zipCode: '90001'
        }
    },
    {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        age: 25,
        password: 'password123',
        role: 'moderator',
        phoneNumber: '+1122334455',
        address: {
            street: '789 Pine St',
            city: 'Chicago',
            country: 'USA',
            zipCode: '60601'
        }
    },
    {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@example.com',
        age: 30,
        password: 'password123',
        role: 'user',
        phoneNumber: '+5566778899',
        address: {
            street: '321 Elm St',
            city: 'Houston',
            country: 'USA',
            zipCode: '77001'
        }
    },
    {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@example.com',
        age: 22,
        password: 'password123',
        role: 'user',
        phoneNumber: '+9988776655',
        address: {
            street: '654 Maple Dr',
            city: 'Phoenix',
            country: 'USA',
            zipCode: '85001'
        }
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');
        
        // Insert sample users
        const users = await User.create(sampleUsers);
        console.log(`✅ Added ${users.length} sample users`);
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
