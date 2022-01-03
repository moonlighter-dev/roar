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
    console.log(req.body)
    try {
      const customer = await Customer.findById(req.params.id).lean();
      const invoices = await Invoice.find({ customer: customer.id, isPaid: false })
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


      const newBalance = customer.balance - req.body.total

      await Customer.findOneAndUpdate(
        { _id: payment.customer },
        {
          $set: { balance: newBalance }
        }
      )
      console.log("Customer balance successfully updated!")

      let paymentApplication = payment.amount

      await payment.invoices.forEach(invoice => {

        if (paymentApplication > 0){
          if (paymentApplication > invoice.due) {
            paymentApplication -= invoice.due

            Invoice.findOneAndUpdate(
              { _id: invoice.id },
              {
                $set: { 
                  due: 0.00,
                  overDue: 0.00,
                  isPaid: true, 
                  paidBy: payment._id,
                  
                }
              }
            )
          } else {
            let remaining = invoice.due - paymentApplication
            let updateOverDue = 0.00

            if (invoice.overDue > 0) {
              updateOverDue = invoice.overdue - paymentApplication
            }

            paymentApplication = 0

            Invoice.findOneAndUpdate(
              { _id: invoice.id },
              {
                $set: { 
                  due: remaining,
                  overDue: updateOverDue,
                }
              }
            )
          }
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
      const invoices = await Invoice.find({ paidBy: req.params.id})
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
