import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/connectDB.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  connectDB()
    .then(() => {
      app.on("error", (err) => {
        console.log("Error starting server:", err);
        process.exit(1);
      });
      app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
      });
    })
    .catch((err) => {
      console.log("Error connecting to database:", err);
      process.exit(1);
    });
}

// For serverless environment - simple connection approach
if (isVercel) {
  // Connect to MongoDB once at the start
  connectDB()
    .then(() => {
      console.log("MongoDB connected for serverless environment");
    })
    .catch((error) => {
      console.error("Initial MongoDB connection failed:", error.message);
    });

  // Simple middleware to check connection for each request
  app.use(async (req, res, next) => {
    try {
      // If connection was dropped, reconnect
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
      next();
    } catch (error) {
      console.error("Request-time DB connection error:", error.message);
      res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }
  });
}

export default app;
