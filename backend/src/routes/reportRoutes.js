const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
  getExpenseReport,
  getSettlementReport,
  getDashboardReport,
  groupSummary,
  getAnalytics
} = require("../controllers/reportController");

router.get("/expenses", getExpenseReport);

router.get("/settlements", getSettlementReport);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Dashboard Statistics
 *     tags:
 *       - Reports
 */
router.get("/dashboard", getDashboardReport);

/**
 * @swagger
 * /api/reports/groups/{id}/summary:
 *   get:
 *     summary: Get Group Summary
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group Summary
 */
router.get(
    "/groups/:id/summary",
    authMiddleware,
    groupSummary
);

/**
 * @swagger
 * /api/reports/analytics:
 *   get:
 *     summary: Get Expense Analytics
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense Analytics
 */
router.get(
    "/analytics",
    authMiddleware,
    getAnalytics
);

module.exports = router;