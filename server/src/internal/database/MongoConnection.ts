import mongoose from 'mongoose';
import config from '../../config';

// MongoDB URI, replace with your actual connection string

export const connectToDatabase = async () => {
  try {
    const server = config.server.database.server;
    const port = config.server.database.port;
    const database = config.server.database.database;
    const user = config.server.database.mongo_user;
    const password = config.server.database.mongo_password;

    console.log(`Connecting to MongoDB at mongodb://${user}:xxx@${server}:${port}/${database}`);
    await mongoose.connect(`mongodb://${user}:${password}@${server}:${port}/${database}`);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1); // Exit process with failure
  }
};
