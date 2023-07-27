const path = require("path")
const chokidar = require("../middleware/chokidar")
const POS = require("../models/POS");
const Customer = require("../models/Customer")

module.exports = {
    getDashboard: async (req, res) => {
        try {
          
          const stations = await POS.find({ vendor: req.user.id }).lean()
          //customers
          //reports
          //settings (user)
          
          res.render("dashboard.ejs", {
            stations: stations,
            // this will have status of the pos, button to add, settings, clients, and reports
          })

        } catch (err) {
          console.log(err)
        }
    },
    startPOS: async (req, res) => {
      try {
        const station = await POS.findOneAndUpdate({ id: req.params.id }).lean()
        // set isActive to true
        // set journalPath to the selected path

        chokidar.watchJournal(station.journalPath)

        res.refresh()
      } catch (err) {
      console.log(err)
      }
    },
    stopPOS: async (req, res) => {
      try {
      const pos = await POS.findOne({ id: req.params.id })

      // update POS, change isActive to false and journal path to null
      res.refresh()

      } catch (err) {
        console.log(err)
      }
    },
    readFile: (req, res) => {
      const record = parseTextData(req.file.text)
      console.log(record)
      
      if (record.keys().includes("custCharge")){
        const customer = Customer.findOne({ fullName: record.name }).lean()
        // create a new invoice using the data in record
        // res.redirect("/invoice/createInvoice", { user, record, customer })
      }
      if (record.type === "CLOSE") {
        // if the invoice number ends in x,
        // create a new daily report
        // res.redirect("/reports/createDaily", { user, record })
      }

        function parseTextData(text) {
          const lines = text.split('\n').map(line => line.trim());
        
          const header = lines[1].split(/\s+/);
          const date = header[2];
        
          const type = lines[3].trim().split(/\s+/)[0].toLowerCase();
        
          const totalTax = parseFloat(lines[5].split(/\s+/)[2]);
        
          const sales = {};
          const salesLines = lines.slice(8, 19);
          salesLines.forEach(line => {
            const [saleType, amount] = line.trim().split(/\s+/);
            sales[saleType.toLowerCase()] = parseFloat(amount);
          });
        
          return {
            date,
            type,
            totalTax,
            ...sales
          };
        }

      },
}