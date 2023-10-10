const cloudinary = require("../middleware/cloudinary");
const mafs = require("../middleware/mafs")
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
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error loading invoice",
        page: "error"
      })
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
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error loading invoices",
        page: "error"
      })
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
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error retrieving customers for page",
        page: "error"
      })
    }
  },
  // creates the invoice, uploads the pdf to cloudinary, and updates the customer balance and credit props as needed
  createInvoice: async (req, res) => {
    // console.log(req.body)

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

      function setDueDate(invoiceDate, customer) {
        const terms = customer.terms
        const currentDate = new Date()
      
        const dueYear = invoiceDate.getFullYear()
      
        const invoiceMonth = invoiceDate.getMonth()
      
        const dueMonth = invoiceMonth === 11 ? 0 : invoiceMonth + 1
      
        let dueDay = 15
        
        if (terms != "Net 15th") {
          dueDay = invoiceDate.getDay()
        }
      
        const dueDate = new Date(dueYear, dueMonth, dueDay)

        return dueDate
      }

      const dueDate = setDueDate(date, customer)

      // if the opening balance option was checked, assign the invoice number according to the counter
      if (openingBalance){
        // lookup the value of the counter
        const counterDocumentPromise = await Counter.findOne({ name: "invoiceCounter" });
        const currentCounter = await counterDocumentPromise.then(doc => doc.value)
        
        // set the invoice number to the current counter, formatted with the opening balance prefix
        invoiceNumber = `BAL_${mafs.convertValueToSixDigitString(currentCounter)}`

      } else {
        // set the invoice number to the number that was entered with the default invoice prefix 
        invoiceNumber = `INV_${mafs.convertValueToSixDigitString(req.body.number)}`
      }

      // if customer has a credit, apply that first

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

      // Update the customer balance
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
        dueDate: dueDate,
        isPaid: isPaid,
        paidBy: paidBy,
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
    // Renders page with overdue customer information to edit and select for batch recording of finance charges
    financeCharges: async (req, res) => {
      //check the last finance charge
      const currentCounter = await Counter.findOne({ name: "financeChargeCounter" });
      const chargeNumber = `BAL_${mafs.convertValueToSixDigitString(currentCounter - 1)}`
      const lastFinanceCharge = await Invoice.find({ number: chargeNumber })

      //Convert date string from form input into a date object
      const chargeDateStr = req.body.date
      const chargeDate = new Date(chargeDateStr)

      if (lastFinanceCharge.date === chargeDate) {
        return error("Finance charges already exist for this date.")
      }

      function isOverdue(invoice) {
        const currentDate = new Date()
        return invoice.dueDate ? currentDate - invoice.dueDate > 0 : false
      }

      try {
        const customers = await Customer
          .find()
          .lean();
        
        const openInvoices = await Invoice
          .find({ isPaid: false, })
          .lean();
 
        const overdueInvoices = openInvoices.filter(invoice => isOverdue(invoice))

        const invoiceCustomers = overdueInvoices.map(invoice => invoice.customer)

        const overdueCustomers = new Set(invoiceCustomers).keys()

        const overduedata = {}
        
        overdueCustomers.forEach(overdueCustomer => {
          const fullCustomer = customers.find(cust => cust.id === overdueCustomer.id)

          const overdueBalance = overdueInvoices.filter(invoice => invoice.customer === overdueCustomer.id).reduce(acc, inv => acc += inv.total, 0)

          let financeCharge = overdueBalance * 0.15

          if (financeCharge < 1) {
            financeCharge = 0
          }
          
          overduedata.push(
            { customer: fullCustomer, overdue: overdueBalance, financeCharge: financeCharge })
      })

        res.render("invoice/finance-charges.ejs", {
          date: chargeDate, 
          customers: customers,
          overduedata: overduedata,
          user: req.user, 
          page: 'finance-charges', 
        });
  
      } catch (err) {
        console.error(err);
        res.status(500).render("/error/500.ejs", {
          user: req.user,
          error: "Error loading page",
          page: "error"
        })
      }
    },
  // loops through the overdue customers and applies the finance charges
  createFinanceCharges: async (req, res) => {
    // console.log(req.body)
    
    try {
      // use the financeCharge counter to find the most recent finance charge

      // req.body: req.body.date (date), req.body.total (array), and req.body.customer (array)
      const { customers, totals, date } = req.body

      customers.forEach(async (customer, index) => {

      let dueAmt = totals[index]
      
      const counterDocumentPromise = await Counter.findOne({ name: "financeChargeCounter" });
      const currentCounter = await counterDocumentPromise.then(doc => doc.value)
      chargeNumber = `BAL_${mafs.convertValueToSixDigitString(currentCounter)}`

      // Update the customer balance

      const customerUpdatePromise = await Customer.findByIdAndUpdate(
        customer,
        {
          $inc: { balance: dueAmt },
        }
      )
      console.log("Customer balance successfully updated!")

      const chargePromise = await Invoice.create({
        number: chargeNumber,
        date: date,
        customer: customer,
        total: dueAmt,
        due: dueAmt,
        dueDate: null,
        isPaid: false,
        paidBy: null,
      });

      await Promise.all([
        customerUpdatePromise,
        chargePromise,
        counterDocumentPromise.then(doc => {
          doc.value += 1;
          return doc.save();
        }),
      ]);

      console.log("Charge has been added!");
    })
      console.log("All charges have been added!")

      res.redirect('/reports/');
    } catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error creating charges",
        page: "error"
      })
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
      if (invoice.file) {
        await cloudinary.uploader.destroy(invoice.cloudinaryId);
      }
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
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error deleting invoice",
        page: "error"
      })
    }
  },
};


