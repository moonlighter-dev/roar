const cloudinary = require("../middleware/cloudinary");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");

module.exports = {
  getInvoice: async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      const customer = await Customer.findById(invoice.customer)
      res.render("invoice/invoice.ejs", { invoice: invoice, customer: customer, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getInvoices: async (req, res) => {
    try {
      const customer = await Customer.find({ id: req.params.id })
      const invoices = await Invoice.find({ customer: customer }).sort({ date: 1 }).lean();
      res.render("invoices.ejs", { invoices: invoices, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  newInvoice: async (req, res) => {
    try {
      const customers = await Customer.find().lean();
      res.render("invoice/new-invoice.ejs", { customers: customers, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createInvoice: async (req, res) => {
    console.log(req.body)
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      const customer = await Customer.findById(req.body.customer)
      const newBalance = (+customer.balance + req.body.total)
      let dueAmt = req.body.total

      if (+customer.balance < 0) {
        if (dueAmt + customer.balance < 0) {
          dueAmt = 0.00
        } else {
          dueAmt += customer.balance
        }
      }

      const invoice = await Invoice.create({
        // need this number to increment for every invoice created
        number: req.body.number,
        date: req.body.date,
        customer: req.body.customer,
        total: req.body.total,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        due: dueAmt,
      });
      console.log("Invoice has been added!");
      
      await Customer.findOneAndUpdate(
        { _id: invoice.customer },
        {
          $set: { balance: newBalance.toString() }
        }
      )
      console.log("Customer balance successfully updated!")
      res.redirect(`/customers/viewCustomer/${invoice.customer}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteInvoice: async (req, res) => {
    try {
      // Find invoice by id
      let invoice = await Invoice.findById(req.params.id);
      const customer = await Customer.findById(invoice.customer)
      const newBalance = customer.balance - invoice.total
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(invoice.cloudinaryId);
      // Delete post from db
      await Invoice.remove({ _id: req.params.id });
      console.log("Deleted Invoice");
      
      await Customer.findOneAndUpdate(
        { _id: invoice.customer },
        {
          $set: { balance: newBalance }
        }
      )
      console.log("Customer balance successfully updated!")
      res.redirect(`/customers/viewCustomer/${invoice.customer}`);
    } catch (err) {
      res.redirect(`/customers`);
    }
  },
};
