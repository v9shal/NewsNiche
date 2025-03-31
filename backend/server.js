const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const UserModel = require("./models/userModel");
const BookMark = require("./models/bookmark");
const authRoutes = require("./routes/authRoute");
const newsRoutes = require("./routes/newsRoute");
const bookMarkRoutes = require("./routes/bookMark");
const History = require("./models/history");

// Create express app
const app = express();
const port = 7000;

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS Configuration with credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/bookmark", bookMarkRoutes);

// Simple test route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Export `app` for testing
module.exports = app;

// Start the server after initializing tables (only when not in test mode)
if (require.main === module) {
  const startServer = async () => {
    try {
      await UserModel.initTable(); // Initializes users table
      await BookMark.initTable();
      await History.initTable(); // Initialize bookmarks table

      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`API available at http://localhost:${port}/api/`);
      });
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  };

  startServer();
}
