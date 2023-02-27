const mongoose = require("mongoose");

const DailySalesSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  //Drawer
  // check, cc batch, gift card
  //RegisterX Tape
  // cash, check, credit, debit, gift card, charge, returns, sub reg cash, gift cards sold, total payouts, tax
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DailySales", DailySalesSchema);
