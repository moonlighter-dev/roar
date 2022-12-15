const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Customer Routes

//Get all Customers
router.get("/customers", ensureAuth, customersController.getCustomers)

//Get One Customer
router.get("/:id", customersController.getCustomer);

//Go to New Customer Form
router.get("/newCustomer", customersController.newCustomer);

//Create a new Customer (with form input)
router.post("/createCustomer", customersController.createCustomer);

//Go to Edit Customer Form
router.get("/editCustomer/:id", customerController.editCustomer);

//Update a Customer
router.put("/updateCustomer/:id", customersController.updateCustomer);

//Deeelaytay a Customer
router.delete("/deleteCustomer/:id", customersController.deleteCustomer);

module.exports = router;
