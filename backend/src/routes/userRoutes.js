const express = require("express");

const router = express.Router();

const {
  getUsers
} = require("../controllers/userController");

router.get("/", getUsers);

const verifyToken =
require("../middleware/authMiddleware");

router.get(
  "/profile",
  verifyToken,
  (req, res) => {

    res.json({
      message: "Protected Route",
      user: req.user
    });

  }
);

module.exports = router;