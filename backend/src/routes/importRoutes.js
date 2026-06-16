const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

const {
  analyzeCSV,
  confirmImport
} = require("../controllers/importController");

/**
 * @swagger
 * /api/import/analyze:
 *   post:
 *     summary: Analyze CSV File
 *     tags:
 *       - Import
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               group_id:
 *                 type: integer
 */
router.post(
  "/analyze",
  upload.single("file"),
  analyzeCSV
);

/**
 * @swagger
 * /api/import/confirm:
 *   post:
 *     summary: Confirm and Import CSV Data
 *     tags:
 *       - Import
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               rows:
 *                 type: array
 */
router.post(
  "/confirm",
  confirmImport
);

module.exports = router;