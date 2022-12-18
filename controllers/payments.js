const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");

module.exports = {
  getPayment: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);
      const customer = await Customer.findbyId(payment.customer)
      const invoices = await Invoice.find({ paidBy: payment.id })
      res.render("/payment/payment.ejs", { payment: payment, customer: customer, invoices: invoices });
    } catch (err) {
      console.log(err);
    }
  },
  newPayment: async (req, res) => {
    try {
      const customers = await Customer.find().lean();
      res.render("/payment/new-payment.ejs", { customers: customers });
    } catch (err) {
      console.log(err);
    }
  },
  createPayment: async (req, res) => {
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
  deletePayment: async (req, res) => {
    try {
      // Find payment by id
      let payment = await Payment.findById(req.params.id);
      const customer = await Customer.findById(payment.customer)
      const newBalance = customer.balance + payment.total

      // also need to go the the invoices and mark them unpaid and remove the paidby data
      const invoices = req.params.invoices

      await invoices.forEach(invoice => {
        Invoice.findOneAndUpdate(
          { _id: invoice.id },
          {
            $set: { isPaid: false, paidBy: null }
          }
        )
      });
      console.log('All invoices updated!')

      // Delete post from db
      await Payment.remove({ _id: payment.id });
      console.log("Deleted Payment");
      
      await Customer.findOneAndUpdate(
        { _id: payment.customer },
        {
          $set: { balance: newBalance }
        }
      )
      console.log("Customer balance successfully updated!")
      res.redirect(`/customer/${payment.customer}`);
    } catch (err) {
      res.redirect(`/customers`);
    }
  },
};
