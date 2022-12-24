const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String
  },
  altPhone: {
    type: String
  },
  email: {
    type: String
  },
  billTo: {
    type: String,
    required: true,
  },
  limit: {
    type: String,
    required: true,
  },
  terms: {
    type: String,
    default: "Net 15th"
  },
  taxId: {
    type: Number,
    default: null,
  },
  balance: {
    type: String,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
