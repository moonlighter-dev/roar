const mongoose = require("mongoose");

const POSSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  isActive: { type: Boolean },
  journalPath: { type: String, unique: true },
  lastUpdated: { type: Date }
});

module.exports = mongoose.model("POS", POSSchema);
