const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({

  number: {
     //regular invoices "INV_000000", opening balances "BAL_000000", finance charges "FIN_000000"
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    unique: true,
  },
  cloudinaryId: {
    type: String,
    unique: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  due: {
    type: Number,
    required: true,
  },
  overDue: {
    type: Number,
    default: 0.00,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
