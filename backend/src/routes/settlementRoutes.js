const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createSettlement
} = require("../controllers/settlementController");

/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Create Settlement
 *     tags:
 *       - Settlements
 *     security:
 *       - bearerAuth: []
 */
/**
 * @swagger
 * /api/settlements:
 *   get:
 *     summary: Get All Settlements
 *     tags:
 *       - Settlements
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authMiddleware,
  createSettlement
);

module.exports = router;