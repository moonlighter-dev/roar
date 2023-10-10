const Invoice = require("../models/Invoice")
const Customer = require("../models/Customer")
const Payment = require("../models/Payment")
const pdfkit = require("../middleware/pdfkit")

module.exports = {
  getReports: async (req, res) => {
    try {
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
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error loading reports page",
        page: "error"
      })
    }
  },
  reviewDaily: async (req, res) => {
    const { date } = req.body

    try {

      //Assemble data for the selected date
      const invoices = await Invoice
        .find({ date: date })
        .lean()
      const payments = await Payment
        .find({ date: date })
        .lean()
      const customers = await Customer
        .find()
        .lean()
        
      // Render report with data

      res.render("reports/daily-report.ejs", {
        date: date, 
        customers: customers,
        invoices: invoices,
        payments: payments,
        user: req.user,
        page: "daily-report", 
      });

    } catch (err) {
      console.error(err);
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error compiling daily report",
        page: "error"
      })
    }
  },
  createDaily: async (req, res) => {
    const { cash, checks, cc, redeemGC, date } = req.body


    try {

      //use table data to print the report to pdf
      // cash: cash,
      // checks: checks,
      // cc: cc,
      // redeemGC: redeemGC,

      //after success, redirect to /reports

    } catch (err) {
      console.error(err);
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error processing daily report",
        page: "error"
      })
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
      res.status(500).render("error/500.ejs", {
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
      res.status(500).render("error/500.ejs", {
        user: req.user,
        error: "Error creating statements",
        page: "error"
      })
    }
  }
}
