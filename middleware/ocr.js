const tesseract = require('node-tesseract-ocr');

module.exports = {
  scan: async (req, res) => { 

    try {
      
      // Configuration options for Tesseract OCR
      const config = {
        lang: 'eng',
        oem: 1,
        psm: 3,
        whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,',
        preserve_interword_spaces: 1,
      };

      const text = await tesseract.recognize(image, config);
      
      console.log('OCR Result for image', text);
      res.text(text);
    }
   catch(err) {
    console.error(`Error processing OCR for image:`, err);
    }
  }
}