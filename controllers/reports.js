const Invoice = require("../models/Invoice")
const Customer = require("../models/Customer")
const Payment = require("../models/Payment")
const fs = require('fs');
const pdfkit = require("../middleware/pdfkit")

module.exports = {
  getReports: async (req, res) => {
    try {
      // let's pass in helpful variables so that we can make easier choices
      // how about adding a date of last finance charge so we can prevent doubling up, a recommendation to use the last day of the previous month for finance charge and statements inputs, and an automatic recommendation to use the previous day for the daily report.
      res.render("reports/reports.ejs", { 
        user: req.user, 
        page: "reports" 
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading reports page")
    }
  },
  createDaily: async (req, res) => {
    //req.body: req.body.date, req.body.checks, req.body.cc, req.body.redeemGC

    //instead of uploading the image we want to enable client side js to read the file and return the text. Then we will extract the data from the text and combine it with the req.body to create the report.


    try {

      //Assemble data for the selected date
      const invoices = await Invoice
        .find({ date: req.body.date })
        .lean()
      const payments = await Payment
        .find({ date: req.body.date })
        .lean()
      const customers = await Customer
        .find()
        .lean()   

      const tableDataAR = invoices.map(invoice => {
        const customer = customers.find(cust => cust.id === invoice.customer)
        [invoice.number, customer.companyName, invoice.total]
      })


      const tableDataRL = [req.body.cash, req.body.checks, req.body.cc, req.body.redeemGC]

      // console.log("Values entered:", tableDataRL, "Values uploaded:", tableDataX)

      // pdfkit.dailyReport({ tableDataAR, tableDataRL, tableDataX })

    } catch (err) {
      console.log(err);
    }
  },
  newInterest: async (req, res) => {
    try {
      const customers = await Customer
        .find()
        .lean();
      const invoices = await Invoice
        .find()
        .lean()
      res.render("interest/newInterest", { 
        customers: customers,
        invoices: invoices,
        page: "newInterest", 
      });
    } catch (err) {
      console.log(err);
    }
  },
  reviewStatements: async (req, res) => {
    // ACHTUNG! THIS HASN'T BEEN EDITED! 
    try {
      const payment = await Payment.create({
        number: req.body.number,
        date: req.body.date,
        customer: req.body.customer,
        amount: req.body.amount,
        tender: req.body.tender,
      });
      console.log("Payment has been added!");

      // Invoices selected as part of the req.body can be updated in the isPaid prop to true, and the paidBy prop to payment.id

      const invoices = req.body.invoices

      await invoices.forEach(invoice => {
        Invoice.findOneAndUpdate(
          { _id: invoice.id },
          {
            $set: { isPaid: true, paidBy: payment.id }
          }
        )
      });
      console.log('All invoices updated!')

      const customer = await Customer.findById(payment.customer)
      const newBalance = customer.balance - req.body.total

      await Customer.findOneAndUpdate(
        { _id: payment.customer },
        {
          $set: { balance: newBalance }
        }
      )
      console.log("Customer balance successfully updated!")
      
      res.redirect(`/customer/${payment.customer}`);
    } catch (err) {
      console.log(err);
    }
  },
  createStatements: async (req, res) => {
    try {
      const customers = await Customer
      .find()
      .lean();
      const invoices = await Invoice
      .find()
      .lean()
      // iterate through customers and find those who had an open balance at the statement date
      // create pdfs using a template that shares invoice information from the previous month
    } catch (err) {
      console.log(err);
    }
  }
}
