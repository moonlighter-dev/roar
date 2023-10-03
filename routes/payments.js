const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Payment Routes

//Get One Payment
router.get("/viewPayment/:id", ensureAuth, paymentsController.getPayment);

//Go to New Payment Form
router.get("/newPayment/:id", ensureAuth, paymentsController.newPayment);

//Create a new Payment (using form input)
router.post("/createPayment", ensureAuth, paymentsController.createPayment);

//Deeelaytay a Payment
router.delete("/deletePayment/:id", ensureAuth, paymentsController.deletePayment);

module.exports = router;
