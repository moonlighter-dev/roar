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
      console.log(err);
    }
  },
  newPayment: async (req, res) => {
    // console.log(req.params)
    try {
      const customer = await Customer
        .findById(req.params.id)
        .lean();
      const invoices = await Invoice
        .find({ customer: customer._id, isPaid: false })
        .sort({ date: 1 })
      
        // console.log(invoices)

      res.render("payment/new-payment.ejs", { 
        customer: customer, 
        invoices: invoices, 
        user: req.user,
        page: "new-payment"
      });
    } catch (err) {
      console.log(err);
    }
  },
  createPayment: async (req, res) => {
    console.log(req.body)
    
    const credit = req.body.amount - req.body.appliedPayment

    try {
      const payment = await Payment
        .create({
          number: req.body.number,
          date: req.body.date,
          customer: req.body.customer,
          amount: req.body.amount,
          tender: req.body.tender,
        });

      console.log("Payment has been added!");

      if (credit > 0.00) {
        await Customer
          .findOneAndUpdate(
            { _id: payment.customer },
            {
              $set: { credit: credit }
            }
          )
        console.log("Remaining credit applied successfully!")
      }
      
      const customer = await Customer
        .findOneAndUpdate(
          { _id: payment.customer },
          {
            $inc: { balance: -payment.amount }
          }
        )        

      console.log("Customer balance successfully updated!")

      const paidInvoices = req.body.invoices
      const allInvoices = req.body.payIndex

      if (typeof(paidInvoices) === "string") {
        const invoice = await Invoice.findById(paidInvoices)
        updateInvoice(invoice, req.body.appliedPayment)
      } else {

      await paidInvoices.forEach((invoice) => {
        const index = allInvoices.indexOf(invoice)
        const payAmt = req.body.payments[index]

        console.log(payAmt)

        updateInvoice(invoice, payAmt)

      });
      }

      async function updateInvoice(invoice, payAmt) {
        // if the payAmount is less than the invoice amount
        // is there an overDue amount? subtract the payAmount and update it
        let currentInvoice = await Invoice.findById(invoice)
        let dueAmt = currentInvoice.due
        let update = {}

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

        await Invoice.findOneAndUpdate(
          { _id: invoice },
          update
        )
      }
      
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

      invoices.forEach(async invoice => {
        await Invoice.findOneAndUpdate(
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
