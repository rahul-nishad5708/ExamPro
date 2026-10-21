import mongoose from 'mongoose';
import config from './index.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  if (!config.mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('✅ MongoDB connection re-established.');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failure: ${error.message}`);
    throw error;
  }
};

export default connectDB;

