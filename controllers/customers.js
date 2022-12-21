const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");

module.exports = {
  getCustomers: async (req, res) => {
    try {
      const customers = await Customer.find().sort({ createdAt: "desc" }).lean();
      res.render("customer/customers.ejs", { customers: customers });
    } catch (err) {
      console.log(err);
    }
  },
  getCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      const invoices = await Invoice.find({ customer: customer.id })
      res.render("customer/customer.ejs", { customer: customer, invoices: invoices });
    } catch (err) {
      console.log(err);
    }
  },
  newCustomer: (req, res) => {
    res.render("customer/new-customer.ejs")
  },
  createCustomer: async (req, res) => {
    try {
      await Customer.create({
        companyName: req.body.companyName,
        fullName: req.body.fullName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        limit: req.body.limit,
        terms: req.body.terms,
        taxId: req.body.taxId,
        balance: 0,
        addedOn: Date.now(),
      });
      console.log("Customer has been added!");
      res.redirect("/customers");
    } catch (err) {
      console.log(err);
    }
  },
  editCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      res.render("customer/edit-customer.ejs", { customer: customer });
    } catch (err) {
      console.log(err);
    }
  },
  updateCustomer: async (req, res) => {
    try {
      await Customer.findOneAndUpdate(
        { _id: req.params.id },
        {
          companyName: req.body.companyName,
          fullName: req.body.fullName,
          phone: req.body.phone,
          email: req.body.email,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          taxId: req.body.taxId,
        }
      );
      console.log("Customer updated!");
      res.redirect(`/customer/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteCustomer: async (req, res) => {
    try {
      await Customer.remove({ _id: req.params.id });
      console.log("Deleted Customer");
      res.redirect("/customers");
    } catch (err) {
      res.redirect(`/customer/${req.params.id}`);
    }
  },
};
