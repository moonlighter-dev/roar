const express = require("express");
const payments = require("../controllers/payments");
const router = express.Router();
const paymentsController = require("../controllers/payments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Payment Routes


//Get One Payment
router.get("/:id", paymentsController.getPayment);

//Go to New Payment Form
router.get("/newPayment", paymentsController.newPayment);

//Create a new Payment (using form input)
router.post("/createPayment", paymentsController.createPayment);

//Deeelaytay a Payment
router.delete("/deletePayment/:id", paymentsController.deletePayment);

module.exports = router;
