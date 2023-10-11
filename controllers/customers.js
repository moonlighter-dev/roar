const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

// Access the Counter collections
const db = mongoose.connection;
const Counter = db.collection('Counters');

module.exports = {
  // get all customers - also used as a dashboard
  getCustomers: async (req, res) => {
    try {
      const customers = await Customer
        .find({ vendor: req.user.id })
        .sort({ companyName: 1 })
        .lean();

      res.render("customer/customers.ejs", { 
        customers: customers, 
        user: req.user,
        page: "customers" 
      });

    } catch (err) {
      console.error(err);
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error loading customers",
        page: "error"
      })
    }
  },
  // individual customer view - access to payment link and list of open invoices and payments
  getCustomer: async (req, res) => {
    try {
      const customer = await Customer
        .findById(req.params.id)
        .lean();
      const invoices = await Invoice
        .find({ customer: customer._id })
        .lean()
      const payments = await Payment
        .find({ customer: customer._id })
        .lean()

      res.render("customer/customer.ejs", { 
        customer: customer, 
        invoices: invoices, 
        payments: payments, 
        user: req.user,
        page: "customer"
      });

    } catch (err) {
      console.error(err);
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error retrieving customer",
        page: "error"
      })
    }
  },
  // generate new customer form page
  newCustomer: (req, res) => {
    res.render("customer/new-customer.ejs", { 
      user: req.user,
      page: "new-customer",
     })
  },
  // create a new customer
  createCustomer: async (req, res) => {
    // console.log(req.body)
    try {

      const customer = await Customer.create({
        companyName: req.body.companyName,
        fullName: req.body.fullName,
        phone: req.body.phone,
        altPhone: req.body.altPhone,
        email: req.body.email,
        billTo: req.body.billTo,
        limit: req.body.limit,
        terms: req.body.terms,
        taxId: req.body.taxId,
        balance: 0.00,
        openingBalance: req.body.openingBalance,
        credit: 0.00,
        vendor: req.user.id,
        addedOn: Date.now(),
      });

      console.log("Customer has been added!");

      if (customer.openingBalance > 0) {
        const counterDocumentPromise = await Counter.findOne({ name: "invoiceCounter" });
        const currentCounter = await counterDocumentPromise.then(doc => doc.value)
        
        // set the invoice number to the current counter, formatted with the opening balance prefix
        const invoiceNumber = `BAL_${mafs.convertValueToSixDigitString(currentCounter)}`

        const openingBalance = await Invoice.create({
          date: new Date(),
          number: invoiceNumber,
          customer: customer.id,
          total: customer.openingBalance,
          due: customer.openingBalance,
          dueDate: new Date(),
          isPaid: false,
          paidBy: null,
        })
      }
      res.render("/customer/customer.ejs", {
        customer: customer, 
        user: req.user, 
        page: "view-customer",
      });

    } catch (err) {
      console.error(err);
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error adding customer",
        page: "error"
      })
    }
  },
  // generate customer edit form and populate with current data
  editCustomer: async (req, res) => {
    try {
      const customer = await Customer
        .findById(req.params.id)
        .lean();

      res.render("customer/edit-customer.ejs", { 
        customer: customer, 
        user: req.user, 
        page: "edit-customer",
       });

    } catch (err) {
      console.error(err);
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error loading customer",
        page: "error"
      })
    }
  },
  // update customer info using form
  updateCustomer: async (req, res) => {
    // console.log(req.body)
    try {
      const customer = await Customer.find(req.body.customer).lean()
      // check if the opening balance has changed
      // delete, create, or update an opening balance invoice
      if (customer.openingBalance != req.body.openingBalance) {
        if (customer.openingBalance === 0) {
          //add an opening balance invoice
        } else if (req.body.openingBalance === 0) {
          //find and delete an opening balance invoice
        } else {
          //find an opening balance invoice and update it
        }
    }

      await Customer.findOneByIdAndUpdate((req.body.customer),
        {
          companyName: req.body.companyName,
          fullName: req.body.fullName,
          phone: req.body.phone,
          altPhone: req.body.altPhone,
          email: req.body.email,
          billTo: req.body.billTo,
          limit: req.body.limit,
          openingBalance: req.body.openingBalance,
        }
      );

      console.log("Customer updated!");
      res.redirect(`/customers/viewCustomer/${req.params.id}`);

    } catch (err) {
      console.error(err)
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error updaging customer",
        page: "error"
      })
    }
  },
  // deeelaytay a customer
  deleteCustomer: async (req, res) => {
    try {
      await Customer.remove({ _id: req.params.id });

      console.log("Deleted Customer");
      res.redirect("/customers");
    } catch (err) {
      console.error(err)
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error deleting customer",
        page: "error"
      })
    }
  },
};
