const express = require("express");

const router = express.Router();

const verifyToken =
require("../middleware/authMiddleware");

const {
  createGroup,
  getGroups,
  addMember,
  removeMember
} = require("../controllers/groupController");

router.post(
  "/",
  verifyToken,
  createGroup
);

router.get(
  "/",
  verifyToken,
  getGroups
);

router.post(
  "/:groupId/member",
  verifyToken,
  addMember
);

router.delete(
  "/:groupId/member/:userId",
  verifyToken,
  removeMember
);

module.exports = router;
