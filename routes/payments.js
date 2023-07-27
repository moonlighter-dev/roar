const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Payment Routes

//JSON READ Operations
router.get("/json/:date", paymentsController.paymentsByDateJSON)
router.get("/json/:customer", paymentsController.paymentsByCustomerJSON)
router.get("/json/:id", paymentsController.getPaymentJSON)

//Get One Payment
router.get("/viewPayment/:id", paymentsController.getPayment);

//Go to New Payment Form
router.get("/newPayment/:id", paymentsController.newPayment);

//Create a new Payment (using form input)
router.post("/createPayment", paymentsController.createPayment);

//Deeelaytay a Payment
router.delete("/deletePayment/:id", paymentsController.deletePayment);

module.exports = router;
