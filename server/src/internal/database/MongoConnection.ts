import mongoose from 'mongoose';
import { getConfig } from "../../config";
const config = getConfig();

// MongoDB URI, replace with your actual connection string

export const connectToDatabase = async () => {
  try {
    const server = config.server.database.server;
    const database = config.server.database.database;
    const user = config.server.database.mongo_user;
    const password = config.server.database.mongo_password;
    const protocol = config.server.database.mongo_protocol;

    console.log(`Connecting to MongoDB at ${protocol}://${user}:xxx@${server}/${database}`);
    await mongoose.connect(`${protocol}://${user}:${password}@${server}/${database}`);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
};
