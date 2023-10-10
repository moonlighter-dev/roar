const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Report Routes

//Get Reports Menu
router.get("/", ensureAuth, reportsController.getReports);

//View Daily Report
router.post("/dailyReport", ensureAuth, reportsController.reviewDaily)

//Print Daily Report
router.post("/printDailyReport", ensureAuth, reportsController.createDaily)

//Review Statements
router.post("/reviewStatements", ensureAuth, reportsController.reviewStatements);

//Print Statements
router.post("/createStatements", ensureAuth, reportsController.createStatements);

module.exports = router;
