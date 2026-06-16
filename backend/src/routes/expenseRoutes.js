const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createExpense,
  splitExpense,
  getBalances,
  getGroupExpenses,
  getExpensesBetweenUsers
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               expense_date:
 *                 type: string
 *                 format: date
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
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                     amount:
 *                       type: number
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

/**
 * @swagger
 * /api/expenses/between/{user1}/{user2}:
 *   get:
 *     summary: Get Expenses Between Two Users
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user1
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: user2
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  "/between/:user1/:user2",
  authMiddleware,
  getExpensesBetweenUsers
);

module.exports = router;