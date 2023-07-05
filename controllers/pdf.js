const path = require("path")

module.exports = {
    viewPDF: (req, res) => {
      console.log(req.session.tmpFilePath)
      const tmpFilePath = req.session.tmpFilePath
    try{
      // Set appropriate headers for the PDF response
      res.setHeader('Content-Type', 'application/pdf')
      
      // Stream the PDF file to the response
      res.pdf(tmpFilePath)
    } catch (err) {
      console.error(err)
    }
  },
}