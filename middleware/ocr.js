const path = require('path');
const fs = require('fs');
const { convert } = require('pdf2image');
const tesseract = require('node-tesseract-ocr');

// Function to convert PDF to PNG images
async function convertPDFToPNG(pdfPath) {
  try {
    const options = {
      outputFormat: 'png',
      quality: 100,
      density: 300,
      width: 1000,
      height: 1000,
    };

    const images = await convert(pdfPath, options);
    return images;
  } catch (error) {
    console.error('Error converting PDF to PNG:', error);
    throw error;
  }
}

// Function to perform OCR on an image buffer
async function performOCR(imageBuffer) {
  try {
    const config = {
      lang: 'eng',
      oem: 1,
      psm: 3,
    };

    const text = await tesseract.recognize(imageBuffer, config);
    return text;
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
}

module.exports = {
  scan: async (req, res) => {

    // Configuration options for Tesseract OCR
    const ocrConfig = {
      lang: 'eng',
      oem: 1,
      psm: 3,
      preserve_interword_spaces: 1,
    };
  
    const worker = tesseract({
      lang: 'eng',
      whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,',
    });

    const pdfPath = req.file.path;
    const pdfBuffer = fs.readFileSync(pdfPath);

    try {
      // Convert PDF to PNG images
      const image = await convertPDFToPNG(pdfPath)
      const text =  await performOCR(image)
      
      console.log(`OCR Result for image ${index + 1}:`, text);

      return text;
    }
   catch(err) {
    console.error(`Error processing OCR for image ${index + 1}:`, err);
    }
  }
}