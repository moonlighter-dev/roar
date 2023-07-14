const path = require("path")

module.exports = {
    readFile: (req, res) => {
      const text = req.file.text
      // This text is uploaded printing results from the register.
      // We want to determine what category it is and format the data accordingly.
      // Then we can send the data on (redirect) to invoices controller, reports controller or ignore it.
      // I can also consider doing some of this processing on the app that will be watching the file and sending the post request.
      // Error handling: if there is an error posting the data and redirecting, it needs to let the user know so they can enter the information manually
        // res.render("pos/pos.ejs", { 
        //   user: req.user,
        //   page: "pos",
        // });
      },
}