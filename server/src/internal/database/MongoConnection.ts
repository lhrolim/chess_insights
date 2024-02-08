import mongoose from 'mongoose';
import config from '../../config';

// MongoDB URI, replace with your actual connection string
const MONGO_URI = config.server.database.mongo_uri;

export const connectToDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at ', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1); // Exit process with failure
  }
};
