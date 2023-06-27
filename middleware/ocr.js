const tesseract = require('node-tesseract-ocr');
const { convertPDFToImages } = require('pdf-poppler');

// Configuration options for Tesseract OCR
const ocrConfig = {
  lang: 'eng',
  oem: 1,
  psm: 3,
  preserve_interword_spaces: 1,
};

exports.scan = async (req, res, next) => {
    const worker = tesseract({
    lang: 'eng',
    whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,',
    });

    // Get the path of the uploaded PDF file
    const { path } = req.file;

    try {
      // Initialize the Tesseract worker before using it
      await worker.load();
      await worker.loadLanguage();
      await worker.initialize();

        // Convert the PDF to an image
      const images = await convertPDFToImages(path, { format: 'png', singleProcess: true });

      // Extract text from the image using OCR
      const result = await tesseract.recognize(images[0], ocrConfig);

      res.json(result)
    }
   catch(err) {
    console.error('OCR Error:', err)
    res.status(500).json({ error: 'An error occurred during OCR processing.' })
    }
  }