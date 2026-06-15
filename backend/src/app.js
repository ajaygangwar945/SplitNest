const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("SplitNest Backend Running");
});

app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});