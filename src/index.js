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

// For serverless environment - ensure DB connection
let isConnected = false;

const ensureDbConnection = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
      isConnected = true;
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    isConnected = false;
    throw error;
  }
};

// Middleware to ensure database connection for serverless
if (isVercel) {
  app.use(async (req, res, next) => {
    try {
      await ensureDbConnection();
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }
  });
}

export default app;
