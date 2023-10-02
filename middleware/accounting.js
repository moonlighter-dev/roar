module.exports = {
  debit: function (invoice, balance) {
    return balance + invoice
  },
  credit: function (payment, balance) {
    return balance - payment
  },
}