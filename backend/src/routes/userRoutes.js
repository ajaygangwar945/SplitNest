const express = require("express");

const router = express.Router();

const {
  getUsers
} = require("../controllers/userController");

router.get("/", getUsers);

const authMiddleware =
require("../middleware/authMiddleware");

router.get(
  "/profile",
  authMiddleware,
  (req, res) => {

    res.json({
      message: "Protected Route",
      user: req.user
    });

  }
);

module.exports = router;