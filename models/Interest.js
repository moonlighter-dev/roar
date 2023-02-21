const mongoose = require("mongoose");

const InterestSchema = new mongoose.Schema({
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
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Interest", InterestSchema);
