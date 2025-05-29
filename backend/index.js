// index.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connectDb");
const pokemonRoutes = require("./routes/pokemonRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/pokemon", pokemonRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "Pokedex API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
