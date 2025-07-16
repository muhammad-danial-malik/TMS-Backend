import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionString = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`,
      {
        // Serverless optimization settings
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering for serverless
        maxPoolSize: 1, // Maintain up to 1 socket connection
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
