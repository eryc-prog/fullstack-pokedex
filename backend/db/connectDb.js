// connectDb.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    const conn = await mongoose.connect(MONGODB_URI, {});

    console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        console.error("Error during database disconnection:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Retry connection after 5 seconds
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(connectDB, 8000);
  }
};

module.exports = connectDB;
