import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

let dbInstance: mongoose.Connection | null = null;

export const connectToDb = async () => {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://budairoland0:gmzclLU5oeVUBZxv@clustermain.uueri7j.mongodb.net/BoardGame?retryWrites=true&w=majority&appName=ClusterMain');
        console.log('Connected to MongoDB');
        dbInstance = connection.connection;
        return dbInstance;
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};