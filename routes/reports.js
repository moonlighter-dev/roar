const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Report Routes

//Get Reports Menu
router.get("/", reportsController.getReports);

//Create a Daily AR Report (using form input)
router.get("/createDaily", reportsController.createDaily);

//Go to Finance Charge Form
router.get("/newInterest", reportsController.newInterest)

//Create Finance Charges (using form input)
router.post("/createInterest", reportsController.createInterest);

//Create Statements (using form input)
router.get("/createStatements", reportsController.createStatements);

module.exports = router;
