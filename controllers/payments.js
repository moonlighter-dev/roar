const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");

module.exports = {
  getPayment: async (req, res) => {
    try {
      const payment = await Payment
        .findById(req.params.id);
      const customer = await Customer
        .findById(payment.customer)
      const invoices = await Invoice
        .find({ paidBy: payment.id })

      res.render("payment/payment.ejs", { 
        payment: payment, 
        customer: customer, 
        invoices: invoices, 
        user: req.user,
        page: "payment" });

    } catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error loading payment",
        page: "error"
      })
    }
  },
  //Go to new payment input
  newPayment: async (req, res) => {
    // console.log(req.params)
    try {
      const customer = await Customer
        .findById(req.params.id)
        .lean();
      const allInvoices = await Invoice
        .findById(customer._id)
        .sort({ date: 1 })
      const invoices = allInvoices.filter(invoice => !invoice.isPaid)
      
        console.log(invoices)

      res.render("payment/new-payment.ejs", { 
        customer: customer, 
        invoices: invoices, 
        user: req.user,
        page: "new-payment"
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error loading payment page",
        page: "error"
      })
    }
  },
  createPayment: async (req, res) => {
    // console.log(req.body)

    try {
      const { number, date, customer, amount, tender, appliedPayment, invoices, payments } = req.body;

      // Calculate credit
      const credit = amount - appliedPayment;

      const payment = await Payment
        .create({
          number: `REF_${number}`, 
          date, 
          customer, 
          amount, 
          tender
        });

      console.log("Payment has been added!");

      // Update customer credit if necessary
      if (credit > 0.00) {
        await Customer.findByIdAndUpdate(customer, { $set: { credit } });
        console.log("Remaining credit applied successfully!");
      }
      
      // Update customer balance
      const customerUpdate = await Customer.findByIdAndUpdate(customer, { $inc: { balance: -amount } });
      
      console.log("Customer balance successfully updated!");     

      // Process paid invoices
    const updatePromises = invoices.map(async (invoiceId, index) => {
      const payAmt = payments[index];
      const invoice = await Invoice.findById(invoiceId);

      console.log(payAmt);

      const update = {};

      if (payAmt === invoice.due) {
        update.$set = { isPaid: true, due: 0.00, paidBy: payment._id };
      } else {
        update.$inc = { due: -payAmt };
        update.$set = { paidBy: payment._id };
      }

      await Invoice.findByIdAndUpdate(invoiceId, update);
    });

    await Promise.all(updatePromises);
      
      res.redirect(`/customers/viewCustomer/${payment.customer}`);
    } catch (err) {
      console.error(err);
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error creating payment",
        page: "error"
      })
    }
  },
  deletePayment: async (req, res) => {
    try {
      const paymentId = req.params.id
      
      // Find payment by id
      const payment = await Payment.findById(paymentId);
      const invoices = await Invoice.find({ paidBy: paymentId })

      console.log(payment)

      // Create an array of promises to update invoices
    const updatePromises = invoices.map(async (invoice) => {
      await Invoice.findByIdAndUpdate(invoice.id, {
        $set: {
          isPaid: false,
          paidBy: null,
          due: invoice.total,
        },
      }).exec();
    });

    // Use Promise.all to execute all updatePromises concurrently
    await Promise.all(updatePromises);
    console.log('All invoices updated!');

      await Customer.findByIdAndUpdate(
        payment.customer,
        {
          $inc: { balance: payment.amount }
        }
      )
      console.log("Customer balance successfully updated!")

      // Delete post from db
      await Payment.deleteOne({ _id: payment.id });
      console.log("Deleted Payment");

      res.redirect(`/customers/viewCustomer/${payment.customer}`);
    } catch (err) {
      console.error(err)
      res.status(500).render("/error/500.ejs", {
        user: req.user,
        error: "Error deleting payment",
        page: "error"
      })
    }
  },
};
