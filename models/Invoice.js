const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({

  number: {
    type: number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  total: {
    type: number,
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
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
