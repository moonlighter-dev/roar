const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const invoicesController = require("../controllers/invoices");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Invoice Routes

//Get all Invoices
router.get("/Invoices", ensureAuth, invoicesController.getInvoices)

//Get One Invoice
router.get("/:id", invoicesController.getInvoice);

//Go to New Invoice Form
router.get("/newInvoice", invoicesController.newInvoice);

//Create a new Customer (with form input)
router.post("/createInvoice", upload.single("file"), invoicesController.createInvoice);

//Deeelaytay a Invoice
router.delete("/deleteInvoice/:id", invoicesController.deleteInvoice);

module.exports = router;
