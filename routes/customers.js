const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customers");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Customer Routes

//Get all Customers
router.get("/", ensureAuth, customersController.getCustomers)

//Get One Customer
router.get("/viewCustomer/:id", ensureAuth, customersController.getCustomer);

//Go to New Customer Form
router.get("/newCustomer", ensureAuth, customersController.newCustomer);

//Create a new Customer (with form input)
router.post("/createCustomer", ensureAuth, customersController.createCustomer);

//Go to Edit Customer Form
router.get("/editCustomer/:id", ensureAuth, customersController.editCustomer);

//Update a Customer
router.put("/updateCustomer/:id", ensureAuth, customersController.updateCustomer);

//Deeelaytay a Customer
router.delete("/deleteCustomer/:id", ensureAuth, customersController.deleteCustomer);

module.exports = router;
