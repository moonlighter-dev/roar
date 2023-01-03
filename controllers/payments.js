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
    // console.log(req.params)
    try {
      const customer = await Customer.findById(req.params.id).lean();
      const invoices = await Invoice.find({ customer: customer._id, isPaid: false }).sort({ date: 1 })
      console.log(invoices)
      res.render("payment/new-payment.ejs", { customer: customer, invoices: invoices, user: req.user });
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

      const newBalance = customer.balance - payment.amount

      if (unappliedCredit > 0.00) {
        await Customer.findOneAndUpdate(
          { _id: payment.customer },
          {
            $set: { balance: newBalance, credit: unappliedCredit }
          }
        )
      } else {
        await Customer.findOneAndUpdate(
          { _id: payment.customer },
          {
            $set: { balance: newBalance }
          }
        )        
      }

      console.log("Customer balance successfully updated!")

      await payment.invoices.forEach(invoice => {
        // if (the payAmount is more than (or equal to) the invoice 
        // set invoice.isPaid to true
        // is there an overDue amount? set it to 0

        // if the payAmount is less than the invoice amount
        // is there an overDue amount? subtract the payAmount and update it

        if (!invoice.isPaid) {
          Invoice.findOneAndUpdate(
            { _id: invoice },
            {
              set: {
                due: newDue, 
                overDue: overDueUpdate,
              }
            }
          )
        } else {
        Invoice.findOneAndUpdate(
          { _id: invoice },
          {
            $set: { 
              due: 0.00,
              overDue: 0.00,
              isPaid: true, 
              paidBy: payment._id,
              
            }
          }
        )
        }
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
      const invoices = await Invoice.find({ paidBy: req.params.id })
      const newBalance = customer.balance + payment.total

      await invoices.forEach(invoice => {
        Invoice.findOneAndUpdate(
          { _id: invoice.id },
          {
            $set: { 
              isPaid: false, 
              paidBy: null,
              due: invoice.amount,
            }
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
