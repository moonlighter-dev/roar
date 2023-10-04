const cloudinary = require("../middleware/cloudinary");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");

module.exports = {
  // view invoice and associated customer info
  getInvoice: async (req, res) => {
    try {
      const invoice = await Invoice
        .findById(req.params.id)
        .lean()
      
      const customer = await Customer
        .findById(invoice.customer)
        .lean()

      res.render("invoice/invoice.ejs", { 
        invoice: invoice, 
        customer: customer, 
        user: req.user, 
        page: "invoice", 
      });

    } catch (err) {
      console.log(err);
    }
  },
  // view open invoices relating to a customer id param
  getInvoices: async (req, res) => {
    try {
      const customer = await Customer
        .findById(req.params.id)
        .lean()
      const invoices = await Invoice
        .find({ customer: customer })
        .sort({ date: 1 })
        .lean();

      res.render("invoices.ejs", { 
        invoices: invoices, 
        user: req.user, 
        page: "invoices", 
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading invoices")
    }
  },
  // renders page with form to create a new invoice, passing in customers to populate the select field
  newInvoice: async (req, res) => {
    try {
      const customers = await Customer
        .find({ vendor: req.user.id })
        .lean();

      res.render("invoice/new-invoice.ejs", { 
        customers: customers, 
        user: req.user, 
        page: 'new-invoice', 
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading page")
    }
  },
  // creates the invoice, uploads the pdf to cloudinary, and updates the customer balance and credit props as needed
  createInvoice: async (req, res) => {
    // console.log(req.body)
    const convertValueToSixDigitString = (value) => {
      const number = value.toString();
      const leadingZeros = number.padStart(6 - number.length, '0');
      return leadingZeros;
    };
    try {
      const { customer, total, openingBalance, date } = req.body

      const customerPromise = await Customer
        .findById(customer)
        .lean()

      let dueAmt = total
      let creditLeft = 0
      let isPaid = false
      let paidBy = null
      let invoiceNumber

      // if the opening balance option was checked, we want to assign the invoice number according to the counter
      if (openingBalance){
        // lookup the value of the counter
        const counterDocumentPromise = await Counter.findOne({ name: "invoiceCounter" });
        const currentCounter = await counterDocumentPromise.then(doc => doc.value)
        
        // set the invoice number to the current counter, formatted with the opening balance prefix
        invoiceNumber = `BAL_${Invoice.convertValueToSixDigitString(currentCounter)}`

      } else {
        // set the invoice number to the number that was entered with the default invoice prefix 
        invoiceNumber = `INV_${Invoice.convertValueToSixDigitString(req.body.number)}`
      }

      // if customer has a credit we want to apply that first

      if (customerPromise.credit > 0) {
        const lastPaymentPromise = await Payment.findOne({ customer: customer._id })

        console.log(lastPayment)

        paidBy = lastPaymentPromise ? lastPayment.id : null;
        
        if (dueAmt <= customerPromise.credit) {
          dueAmt = 0.00
          isPaid = true
          creditLeft = customerPromise.credit - dueAmt
        } else {
          dueAmt -= customerPromise.credit
        }
      }

      // we also want to update the customer balance

      const customerUpdatePromise = await Customer.findByIdAndUpdate(
        customer,
        {
          $inc: { balance: total },
          $set: { credit: creditLeft },
        }
      )
      console.log("Customer balance successfully updated!")

      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      const invoicePromise = await Invoice.create({
        number: invoiceNumber,
        date: date,
        customer: customer,
        total: total,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        due: dueAmt,
        isPaid: isPaid,
        paidBy: paidBy,
        financeCharge: false,
      });

      await Promise.all([
        customerUpdatePromise,
        invoicePromise,
        openingBalance ? counterDocumentPromise.then(doc => {
          doc.value += 1;
          return doc.save();
        }) : Promise.resolve(),
      ]);

      console.log("Invoice has been added!");

      res.redirect(`/customers/viewCustomer/${customer}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating invoice")
    }
  },
  deleteInvoice: async (req, res) => {
    try {
      const invoiceId = req.params.id
      // Find invoice by id
      const invoice = await Invoice
        .findById(invoiceId)
        .lean()

          // Ensure the invoice exists
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      const customer = await Customer
        .findById(invoice.customer)
        .lean()

      // Delete image from cloudinary
      await cloudinary.uploader.destroy(invoice.cloudinaryId);

      // Delete post from db
      await Invoice
        .deleteOne({ _id: invoiceId });

      console.log("Deleted Invoice");

      // Calculate the credit adjustment
      const credit = Math.max(0, invoice.total - customer.balance);

      // Update the customer's balance and credit
      await Customer.findByIdAndUpdate(
        customer._id,
        {
          $inc: { balance: -invoice.total },
          $set: { credit },
        }
      );
        console.log("Customer balance successfully updated!")

      res.redirect(`/customers/viewCustomer/${invoice.customer}`);

    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting invoice");
    }
  },
};
