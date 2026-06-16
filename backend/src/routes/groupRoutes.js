const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createGroup,
  getGroups,
  addMember,
  removeMember,
  getGroupById,
  getGroupMembers,
  updateGroup,
  deleteGroup
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
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Member Added
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

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: Get Single Group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group details
 */
router.get(
  "/:groupId",
  authMiddleware,
  getGroupById
);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   get:
 *     summary: Get Members Of Group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of members
 */
router.get(
  "/:groupId/members",
  authMiddleware,
  getGroupMembers
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   put:
 *     summary: Update Group Name
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *               group_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated
 */
router.put(
  "/:groupId",
  authMiddleware,
  updateGroup
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   delete:
 *     summary: Delete Group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group deleted
 */
router.delete(
  "/:groupId",
  authMiddleware,
  deleteGroup
);

module.exports = router;