const express = require("express");

const router = express.Router();

const {
  getDashboard,
  getBalances
} = require("../controllers/dashboardController");

router.get("/", getDashboard);

router.get("/balances", getBalances);

module.exports = router;