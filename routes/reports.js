const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Report Routes

//Get Reports Menu
router.get("/", ensureAuth, reportsController.getReports);

//Create Daily Report
router.post("/dailyreport", ensureAuth, reportsController.createDaily)

//Review Statements
router.post("/reviewStatements", ensureAuth, reportsController.reviewStatements);

//Create Statements (using form input)
router.post("/createStatements", ensureAuth, reportsController.createStatements);

module.exports = router;
