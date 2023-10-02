const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const invoicesController = require("../controllers/invoices");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Invoice Routes

//Get One Invoice
router.get("/viewInvoice/:id", invoicesController.getInvoice);

//Go to New Invoice Form
router.get("/newInvoice", invoicesController.newInvoice);

//Posting invoices through POS
router.post("/automagic", invoicesController.automagic)

//Create a new Invoice (using form input)
router.post("/createInvoice", ensureAuth, upload.single("file"), invoicesController.createInvoice);

//Deeelaytay an Invoice
router.delete("/deleteInvoice/:id", ensureAuth, invoicesController.deleteInvoice);

module.exports = router;
