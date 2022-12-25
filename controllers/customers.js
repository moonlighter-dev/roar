const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");

module.exports = {
  getCustomers: async (req, res) => {
    try {
      const customers = await Customer.find({ vendor: req.user.id }).sort({ companyName: 1 }).lean();
      res.render("customer/customers.ejs", { customers: customers, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      const invoices = await Invoice.find({ customer: customer.id })
      res.render("customer/customer.ejs", { customer: customer, invoices: invoices, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  newCustomer: (req, res) => {
    res.render("customer/new-customer.ejs")
  },
  createCustomer: async (req, res) => {
    console.log(req.body)
    try {
      await Customer.create({
        companyName: req.body.companyName,
        fullName: req.body.fullName,
        phone: req.body.phone,
        altPhone: req.body.altPhone,
        email: req.body.email,
        billTo: req.body.billTo,
        limit: req.body.limit,
        terms: req.body.terms,
        taxId: req.body.taxId,
        balance: "0.00",
        vendor: req.user.id,
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
      res.render("customer/edit-customer.ejs", { customer: customer, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  updateCustomer: async (req, res) => {
    console.log(req.body)
    try {
      await Customer.findOneAndUpdate(
        { _id: req.params.id },
        {
          companyName: req.body.companyName,
          fullName: req.body.fullName,
          phone: req.body.phone,
          altPhone: req.body.altPhone,
          email: req.body.email,
          billTo: req.body.billTo,
          taxId: req.body.taxId,
        }
      );
      console.log("Customer updated!");
      res.redirect(`/customers/viewCustomer/${req.params.id}`);
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
