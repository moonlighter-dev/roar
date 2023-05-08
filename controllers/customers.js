const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

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
      console.log(err);
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
      
        // console.log(invoices)

      res.render("customer/customer.ejs", { 
        customer: customer, 
        invoices: invoices, 
        payments: payments, 
        user: req.user,
        page: "customer"
      });

    } catch (err) {
      console.log(err);
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
        balance: 0.00,
        credit: 0.00,
        vendor: req.user.id,
        addedOn: Date.now(),
      });

      console.log("Customer has been added!");
      res.redirect("/customers");

    } catch (err) {
      console.log(err);
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
      console.log(err);
    }
  },
  // update customer info using form
  updateCustomer: async (req, res) => {
    // console.log(req.body)
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
          limit: req.body.limit
        }
      );

      console.log("Customer updated!");
      res.redirect(`/customers/viewCustomer/${req.params.id}`);

    } catch (err) {
      console.log(err)
    }
  },
  // generate form for opening balances
  openingBalances: async (req, res) => {
    try {
      const customers = await Customer.find().lean()

      res.render('customer/opening-balances.ejs', { 
        customers: customers, 
        user: req.user, 
        page: "opening-balances",
      })
    } catch (err) {
      console.log(err)
    }
  },
  // apply opening balances to customer accounts
  applyBalances: async (req, res) => {
    try {
      console.log(req.body)
      const customers = req.body.id
      const balances = req.body['opening-balance']
      let counter = 1
      
      await customers.forEach((customer, i) => {
        if (balances[i] !== "0.00") {
          updateCustomerBalance(customer, balances[i])
          createOpeningBalance(balances[i], customer, counter)
          counter++
        }
      })

      console.log(`${counter} balances updated!`)
      
      async function updateCustomerBalance(id, balance) {
        await Customer
          .findOneAndUpdate(
            { id: id }, 
            { $inc: 
              { balance: balance } 
            })

      }

      async function createOpeningBalance(balance, customerId, counter) {
        const invoiceNumber = "OP-000" + counter
        await Invoice.create({
          number: invoiceNumber,
          customer: customerId,
          total: balance,
          type: "opening-balance",
          due: balance,
          date: Date.now()
        })
      }

      res.redirect("/customers")

    } catch (err) {
      console.log(err)
    }
  },
  // deeelaytay a customer
  deleteCustomer: async (req, res) => {
    try {
      await Customer.remove({ _id: req.params.id });

      console.log("Deleted Customer");
      res.redirect("/customers");
    } catch (err) {
      console.log(err)
      res.redirect(`/customer/${req.params.id}`);
    }
  },
};
