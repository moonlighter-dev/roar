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
    console.log(req.body)
    const credit = req.body.amount - req.body.appliedPayment
    try {
      const payment = await Payment.create({
        number: req.body.number,
        date: req.body.date,
        customer: req.body.customer,
        amount: req.body.amount,
        tender: req.body.tender,
      });
      console.log("Payment has been added!");

      if (credit > 0.00) {
        await Customer.findOneAndUpdate(
          { _id: payment.customer },
          {
            $set: { credit: credit }
          }
        )
        console.log("Remaining credit applied successfully!")
      }
      
      await Customer.findOneAndUpdate(
          { _id: payment.customer },
          {
            $inc: { balance: -payment.amount }
          }
        )        

      console.log("Customer balance successfully updated!")

      const invoices = req.body.invoices

      await invoices.forEach((invoice, index) => { 

            // if the payAmount is less than the invoice amount
        // is there an overDue amount? subtract the payAmount and update it
        const payAmt = req.body.payments[index]
        const dueAmt = req.body.due[index]
        let update = {}

        console.log(payAmt, dueAmt)

        if (payAmt == dueAmt) {
          update = {
              $set: {
                isPaid: true, 
                due: 0.00,
                paidBy: payment.id,
              }
            }
        } else {
          update = {
            $inc: { 
              due: -payAmt,
            },
            $set: {
              paidBy: payment.id,
            }
          }
        }

        Invoice.findOneAndUpdate(
          { _id: invoice },
          update
        ).exec()
      });
      
      res.redirect(`/customers/viewCustomer/${payment.customer}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePayment: async (req, res) => {
    try {
      // Find payment by id
      const payment = await Payment.findById(req.params.id);
      const invoices = await Invoice.find({ paidBy: req.params.id })

      console.log(payment)

      await invoices.forEach(invoice => {
        Invoice.findOneAndUpdate(
          { _id: invoice.id },
          {
            $set: { 
              isPaid: false, 
              paidBy: null,
              due: invoice.total,
            },
          }
        ).exec()
      });
      console.log('All invoices updated!')

      await Customer.findOneAndUpdate(
        { _id: payment.customer },
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
      console.log(err)
      res.redirect(`/customers`);
    }
  },
};
