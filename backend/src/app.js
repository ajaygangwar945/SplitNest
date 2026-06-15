const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);


app.get("/", (req, res) => {
  res.send("SplitNest Backend Running");
});

// 404 handler — catches requests that don't match any route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler — must have exactly 4 params for Express to treat it as an error handler
// Without this, Express 5 dumps raw stack traces (router/index.js:435) to the terminal
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});
