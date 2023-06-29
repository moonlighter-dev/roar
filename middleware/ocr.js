const path = require('path');
const fs = require('fs');
const pdf2image = require('pdf2image');
const PDFParser = require('pdf-parse');
const tesseract = require('node-tesseract-ocr');
const { nextConnectionId } = require('mongoose');

async function validatePDF(pdfPath) {
  try {
    // Read the PDF file
    const pdfData = await PDFParser(pdfPath);

    // Check if any parsing errors were found
    if (pdfData.numpages === 0) {
      console.error('PDF validation error: Empty or invalid PDF file');
      return error
    } if (pdfData.text.trim().length > 1) {
      console.log('PDF successfully parsed for text!')
      return pdfData.text
    }
    console.log('PDF validated with unparsed text', pdfData.info)
    return pdfPath
  } catch (error) {
    console.error('Error validating PDF:', error);
  }
}


// Function to convert PDF to PNG images
async function convertPDFToPNG(pdfPath) {
  
  try {
    const options = {
      outputType: 'png',
      outputFormat: 'png',
      pages: 1,
      density: 300,
    };

    const png = await pdf2image.convertPDF(pdfPath, options);

    console.log(png)
    return png;
  } catch (error) {
    console.error('Error converting PDF to PNG:', error);
    throw error;
  }
}

// Function to perform OCR on an image buffer
async function performOCR(imageBuffer) {
  try {

    // Configuration options for Tesseract OCR
    const config = {
      lang: 'eng',
      oem: 1,
      psm: 3,
      whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,',
      preserve_interword_spaces: 1,
    };

    const text = await tesseract.recognize(imageBuffer, config);
    return text;
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
}

module.exports = {
  scan: async (pdfPath) => {

    try {
      // Convert PDF to PNG images
      const validatedPath = await validatePDF(pdfPath)
      if (validatedPath != pdfPath) {
        console.log('Parsed Result for image', validatedPath)
        return validatedPath
      }
      console.log(validatedPath)
      const image = await convertPDFToPNG(validatedPath)
      // const text =  await performOCR(image)
      
      // console.log('OCR Result for image', text);
      // return text;
    }
   catch(err) {
    console.error(`Error processing OCR for image:`, err);
    }
  }
}