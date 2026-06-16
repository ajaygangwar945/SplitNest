const express = require("express");
const router = express.Router();

const {
  calculateBalances
} = require("../controllers/balanceController");

router.get("/", calculateBalances);

module.exports = router;