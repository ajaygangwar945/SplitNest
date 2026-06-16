const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createExpense,
  splitExpense,
  getBalances,
  getGroupExpenses
} = require("../controllers/expenseController");

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create Expense
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authMiddleware,
  createExpense
);

/**
 * @swagger
 * /api/expenses/{expenseId}/split:
 *   post:
 *     summary: Split Expense
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:expenseId/split",
  authMiddleware,
  splitExpense
);

/**
 * @swagger
 * /api/expenses/balances:
 *   get:
 *     summary: Get Expense Balances
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/balances",
  authMiddleware,
  getBalances
);

/**
 * @swagger
 * /api/expenses/group/{groupId}:
 *   get:
 *     summary: Get Expenses By Group
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  "/group/:groupId",
  authMiddleware,
  getGroupExpenses
);

module.exports = router;