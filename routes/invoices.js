const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const invoicesController = require("../controllers/invoices");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Invoice Routes

//Get all Invoices - not used at this time
router.get("/", ensureAuth, invoicesController.getInvoices)

//Get One Invoice
router.get("/viewInvoice/:id", invoicesController.getInvoice);

//Go to New Invoice Form
router.get("/newInvoice", invoicesController.newInvoice);

//Create a new Invoice (using form input)
router.post("/createInvoice", upload.single("file"), invoicesController.createInvoice);

//Deeelaytay an Invoice
router.delete("/deleteInvoice/:id", invoicesController.deleteInvoice);

module.exports = router;
