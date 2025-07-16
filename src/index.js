import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/connectDB.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

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
