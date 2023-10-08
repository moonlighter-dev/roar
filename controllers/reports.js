const Invoice = require("../models/Invoice")
const Customer = require("../models/Customer")
const Payment = require("../models/Payment")
const fs = require('fs');
const pdfkit = require("../middleware/pdfkit")

module.exports = {
  getReports: async (req, res) => {
    try {
      // let's pass in helpful variables so that we can make easier choices
      // how about adding a date of last finance charge so we can prevent doubling up

      //Important Dates for Preparing Reports
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const lastMonthEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
      
      res.render("reports/reports.ejs", { 
        user: req.user, 
        yesterday: yesterday,
        lastMonthEndDate: lastMonthEndDate,
        page: "reports" 
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error loading reports page",
        page: "error"
      })
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
  //Renders a page with end of month customer information, stats such as number of statements, and a print button
  reviewStatements: async (req, res) => {
    
    try {
      const date = new Date(req.body.statementDate)
      //Prepare list of customers with balances greater than 0
      const customers = await Customer
        .find({ balance: { $gt: 0 }})
        .lean();

        const lastMonthEndDate = new Date(date.getFullYear(), date.getMonth(), 0);

        res.render("reports/statements.ejs", { 
          customers: customers,
          lastMonthEndDate: lastMonthEndDate,
          user: req.user,
          page: "statements", 
        });
    }
    catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error creating page",
        page: "error"
      })
    } 
  },
  //Assembles and prints statement data in pdf form
  createStatements: async (req, res) => {
    // req.body.customers [id's]
    const customers = req.body.customer

    // Calculate the start and end dates for the previous month
    const currentDate = new Date();
    const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);


    try {
      //iterate through the array
      customers.forEach(async customer => {
        const statementCustomer = await Customer
              .findById(customer.id)
              .lean();
        const statementInvoices = await Invoice
              .find({ customer: customer.id, date: {
                $gte: lastMonthStartDate,
                $lte: lastMonthEndDate,
              }})
              .lean()
        const statementPayments = await Payment
              .find({ customer: customer.id, date: {
                $gte: lastMonthStartDate,
                $lte: lastMonthEndDate,
              }})
              .lean()
        
        //Send variables to pdfkit to render a statement page
      })

      console.log("Statements printed successfully!")

      res.redirect("/reports")
    } catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error creating statements",
        page: "error"
      })
    }
  }
}
