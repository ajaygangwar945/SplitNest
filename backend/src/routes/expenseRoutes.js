const express = require("express");

const router = express.Router();

const verifyToken =
require("../middleware/authMiddleware");

const {
  createExpense,
  splitExpense
} = require("../controllers/expenseController");

router.post(
  "/",
  verifyToken,
  createExpense
);

router.post(
  "/:expenseId/split",
  verifyToken,
  splitExpense
);

module.exports = router;