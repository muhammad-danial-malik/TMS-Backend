import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Simple connection without problematic options
    const connectionString = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`,
      {
        // Minimal options that are compatible across all Mongoose versions
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
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
