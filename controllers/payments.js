const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");

module.exports = {
  getPayment: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);
      const customer = await Customer.findById(payment.customer)
      const invoices = await Invoice.find({ paidBy: payment.id })
      res.render("payment/payment.ejs", { payment: payment, customer: customer, invoices: invoices, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  newPayment: async (req, res) => {
    try {
      const customers = await Customer.find().lean();
      res.render("payment/new-payment.ejs", { customers: customers, user: req.user });
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
        invoices: req.body.invoices,
      });
      console.log("Payment has been added!");

      const customer = await Customer.findById(payment.customer)
      const newBalance = customer.balance - req.body.total

      await Customer.findOneAndUpdate(
        { _id: payment.customer },
        {
          $set: { balance: newBalance }
        }
      )
      console.log("Customer balance successfully updated!")

      //what if there is already a credit??


      //iterate through the invoices
      //while payment.total > 0...
      // if payment.total > invoice.due
      // invoice.due set to 0 and payment.total - invoice.due
      // if invoice is overdue, set that amount to 0 too
      // after all the invoices are iterated, what to do with the leftover payment? -- is it enough that it has already been applied to the overall balance?

      await payment.invoices.forEach(invoice => {
        
        Invoice.findOneAndUpdate(
          { _id: invoice.id },
          {
            $set: { 
              isPaid: true, 
              paidBy: payment._id,

            }
          }
        )
      });
      console.log('All invoices updated!')
      
      res.redirect(`/customer/viewCustomer/${payment.customer}`);
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
      res.redirect(`/customer/viewCustomer/${payment.customer}`);
    } catch (err) {
      res.redirect(`/customers`);
    }
  },
};
