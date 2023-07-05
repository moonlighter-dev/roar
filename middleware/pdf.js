const pdf2image = require('pdf2image');
const PDFParser = require('pdf-parse');

module.exports = {
  validatePDF: (pdfPath) => {
    
    try {
      // Read the PDF file
      const pdfData = PDFParser(pdfPath);
      console.log(pdfData.text)
      // Check if any parsing errors were found
      if (pdfData.numpages === 0) {
        console.error('PDF validation error: Empty or invalid PDF file');
        return error
      } if (pdfData.text) {
        console.log('PDF successfully parsed for text!')
        return pdfData.text
      }
      console.log('PDF validated with unparsed text', pdfData.info)
      
      return pdfPath
    } catch (error) {
      console.error('Error validating PDF:', error);
    }
  },
  
  
  // Function to convert PDF to PNG images
  convertPDFToPNG: (pdfPath) => {

    try {
      const options = {
        outputType: 'png',
        outputFormat: 'png',
        pages: 1,
        density: 300,
      };
  
      const pngBuffer = pdf2image.convertPDF(pdfPath, options);
  
      console.log(pngBuffer)
      return pngBuffer
    } catch (error) {
      console.error('Error converting PDF to PNG:', error);
      throw error;
    }
  }
}