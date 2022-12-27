const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({

  number: {
    type: String,
    required: true,
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
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
