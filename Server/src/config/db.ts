import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance: mongoose.Connection | null = null;

export const connectToDb = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');
        dbInstance = connection.connection;
        return dbInstance;
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};