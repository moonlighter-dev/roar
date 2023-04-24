const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Report Routes

//Get Reports Menu
router.get("/", reportsController.getReports);

//Go to Daily Report Form
router.get("/newDaily", reportsController.newDaily);

//Create a Daily AR Report (using form input)
router.post("/createDaily", reportsController.createDaily);

//Create a Daily Sales Report (using form input)
router.post("/createDailySales", reportsController.createDailySales);

//Go to Monthly Report Form
router.get("/newMonthly", reportsController.newMonthly);

//Go to Finance Charge Form
router.get("/newInterest", reportsController.newInterest)



//Create Statements (using form input)
router.post("/createStatements", reportsController.createStatements);

//Create Finance Charges (using form input)
router.post("/createInterest", reportsController.createInterest);

module.exports = router;
