const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const invoicesController = require("../controllers/invoices");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Invoice Routes

//Get One Invoice
router.get("/viewInvoice/:id", ensureAuth, invoicesController.getInvoice);

//Go to New Invoice Form
router.get("/newInvoice", ensureAuth, invoicesController.newInvoice);

//Create a new Invoice (using form input)
router.post("/createInvoice", ensureAuth, upload.single("file"), invoicesController.createInvoice);

//Review and edit Finance Charges before posting
router.post("/FinanceCharges", ensureAuth, invoicesController.financeCharges);

//Create multiple Invoices (finance charges)
router.post("/createFinanceCharges", ensureAuth, invoicesController.createFinanceCharges);

//Deeelaytay an Invoice
router.delete("/deleteInvoice/:id", ensureAuth, invoicesController.deleteInvoice);

module.exports = router;
