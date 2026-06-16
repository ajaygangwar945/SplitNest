const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

const {
  importCSV
} = require("../controllers/importController");

/**
 * @swagger
 * /api/import/csv:
 *   post:
 *     summary: Import CSV File
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
 */
router.post(
  "/csv",
  upload.single("file"),
  importCSV
);

module.exports = router;