const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({

  number: {
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
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
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
    required: true,
    default: 0.00,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
