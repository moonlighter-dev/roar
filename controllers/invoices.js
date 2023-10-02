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
  // view invoices relating to a customer id param
  getInvoices: async (req, res) => {
    try {
      const customer = await Customer
        .find({ id: req.params.id })
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
      console.log(err);
    }
  },
  // renders page with form to create a new invoice, passing in customers to populate the select field
  newInvoice: async (req, res) => {
    try {
      const customers = await Customer
        .find()
        .lean();

      res.render("invoice/new-invoice.ejs", { 
        customers: customers, 
        user: req.user, 
        page: 'new-invoice', 
      });

    } catch (err) {
      console.log(err);
    }
  },
    //adds an invoice from confirmed pos data
    automagic: async (req, res) => {
      try {
        const customer = await Customer
          .find({ name: req.body.customerName })
          .lean();

          //if the customer is not found, then the app needs to throw an error and urge the user to enter the invoice manually.

        const invoice = await Invoice.create({ customer: customer.id, date: Date.now(), number: req.body.number, total: req.body.total })
  
        res.json(invoice)
  
      } catch (err) {
        console.log(err);
      }
    },
  // creates the invoice, uploads the pdf to cloudinary, and updates the customer balance and credit props as needed
  createInvoice: async (req, res) => {
    // console.log(req.body)
    try {

      const customer = await Customer
        .findById(req.body.customer)
        .lean()

      let dueAmt = req.body.total
      let creditLeft = 0
      let isPaid = false
      let paidBy = null

      // if customer has a credit we want to apply that first

      if (customer.credit > 0) {
        const lastPayment = await Payment.findOne({ customer: customer._id })

        console.log(lastPayment)

        paidBy = lastPayment.id
        
        if (dueAmt <= customer.credit) {
          dueAmt = 0.00
          isPaid = true
          creditLeft = customer.credit - dueAmt
        } else {
          dueAmt -= customer.credit
          creditLeft = 0.00
        }
      }

      // we also want to update the customer balance

      await Customer.findOneAndUpdate(
        { _id: customer.id },
        {
          $inc: { balance: req.body.total }
        },
        {
          $set: { credit: creditLeft }
        }
      )
      console.log("Customer balance successfully updated!")

      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      const invoice = await Invoice.create({
        number: req.body.number,
        date: req.body.date,
        customer: req.body.customer,
        total: req.body.total,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        due: dueAmt,
        isPaid: isPaid,
        paidBy: paidBy,
        financeCharge: false,
      });

      console.log("Invoice has been added!");

      res.redirect(`/customers/viewCustomer/${invoice.customer}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteInvoice: async (req, res) => {
    try {
      // Find invoice by id
      const invoice = await Invoice
        .findById(req.params.id)
        .lean()
      const customer = await Customer
        .findById(invoice.customer)
        .lean()

      // Delete image from cloudinary
      await cloudinary.uploader.destroy(invoice.cloudinaryId);

      // Delete post from db
      await Invoice
        .remove({ _id: req.params.id });

      console.log("Deleted Invoice");

      let credit = 0.00

      if (customer.balance < invoice.total) {
        credit = invoice.total - customer.balance
      }
      
      await Customer.findOneAndUpdate(
        { _id: invoice.customer },
        {
          $inc: { balance: -invoice.total }
        },
        {
          $set: { credit: credit }
        }
      )
      console.log("Customer balance successfully updated!")

      res.redirect(`/customers/viewCustomer/${invoice.customer}`);

    } catch (err) {
      res.redirect(`/customers`);
    }
  },
};
