import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectToDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');
        return connection.connection.db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};
