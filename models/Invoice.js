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
    
  },
  cloudinaryId: {
    type: String,
    
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
  type: {
    type: String,
    required: true,
    default: "invoice"
  }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
