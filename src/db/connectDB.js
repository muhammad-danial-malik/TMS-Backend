import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Set mongoose options for serverless
    mongoose.set("bufferCommands", false);
    mongoose.set("bufferMaxEntries", 0);

    const connectionString = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`,
      {
        // Valid MongoDB connection options
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        maxPoolSize: 1, // Maintain up to 1 socket connection
        maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
        connectTimeoutMS: 10000, // Give up initial connection after 10s
      }
    );
    console.log(
      `MongoDB connected Successfully. DB-Host: ${connectionString.connection.host}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    // Don't exit process in serverless environment
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    } else {
      throw error; // Let the caller handle the error
    }
  }
};

export default connectDB;
