const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createGroup,
  getGroups,
  addMember,
  removeMember
} = require("../controllers/groupController");

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create Group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *               created_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group Created
 */
router.post(
  "/",
  authMiddleware,
  createGroup
);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get All Groups
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Groups
 */
router.get(
  "/",
  authMiddleware,
  getGroups
);

/**
 * @swagger
 * /api/groups/{groupId}/member:
 *   post:
 *     summary: Add Member To Group
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:groupId/member",
  authMiddleware,
  addMember
);

/**
 * @swagger
 * /api/groups/{groupId}/member/{userId}:
 *   delete:
 *     summary: Remove Member
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:groupId/member/:userId",
  authMiddleware,
  removeMember
);

module.exports = router;
