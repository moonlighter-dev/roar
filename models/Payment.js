const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  number: {
    type: Number,
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
  amount: {
    type: Number,
    required: true,
  },
  tender: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
