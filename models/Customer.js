const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
    required: true,
  },
  limit: {
    type: Number,
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
    type: Number,
    required: true,
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
