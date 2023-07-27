const PDFDocument = require('pdfkit');

module.exports = {
    dailyReport: async (req, res, next) => {
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="pdf_report.pdf"');

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(12).font('Helvetica-Bold').text('Daily Activity Report', { align: 'center' });

        const columnWidth = (doc.page.width - 100) / 2;

        //define table data
        const tableHeadersAR = ["Invoice, Customer, Amount"]
        const tableDataAR = req.body.tableDataAR
        const tableHeadersX = ["Cash, Checks, Credit, Debit, Charge, Sub Reg Cash, Subtotal, Tax, Total, Returns, Payouts, Gift Cards Sold"]
        const tableDataX = req.body.tableDataX
        const tableHeadersRL = ["Cash, Checks, CC, Redeem GC"]
        const tableDataRL = req.body.tableDataRL

        // Generate the first table at position (50, 50)
        const startY1 = 50;
        const nextY1 = generateTable(doc, tableHeadersAR, tableDataAR, 50, startY1);

        // Generate the second table at the position below the first table
        const startY2 = nextY1;
        const nextY2 = generateVerticalTable(doc, tableHeadersRL, tableDataRL, 50, startY2);

        const startY3 = nextY2;
        generateVerticalTable(doc, tableHeadersX, tableDataX, 50 + columnWidth, startY3)

        // Finalize the PDF document
        doc.end();
    }
}

function generateTableWithFooter(doc, headers, data, footer, x, y) {
    const tableProps = {
      headers,
      rows: data,
      footer,
      cellWidth: 120,
      cellPadding: 10,
      x,
      y,
    };
  
    doc.table(tableProps);
  
    // Calculate the height of the table
    const tableHeight = doc.tableHeight(tableProps);
  
    // Return the y-coordinate for the next table
    return y + tableHeight + 20; // Add some padding between tables
}

function generateVerticalTable(doc, headers, data, x, y) {
    const numRows = data.length;
    const numCols = headers.length;

    // Calculate the height and width of each cell
    const cellHeight = 20;
    const cellWidth = 80;

    // Set the font size and style for the headers
    doc.fontSize(12).font('Helvetica-Bold');

    // Position the headers vertically
    headers.forEach((header, headerIndex) => {
        const headerX = x + cellWidth * headerIndex;
        const headerY = y;
        doc.text(header, headerX, headerY, { width: cellWidth, align: 'center' });
    });

    // Set the font size and style for the table content
    doc.fontSize(12).font('Helvetica');

    // Position the table data
    data.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
        const cellX = x + cellWidth * colIndex;
        const cellY = y + cellHeight * (rowIndex + 1);
        doc.text(cell, cellX, cellY, { width: cellWidth, align: 'center' });
        });
    });

    // Calculate the height of the table
    const tableHeight = cellHeight * (numRows + 1);

    // Return the y-coordinate for the next element
    return y + tableHeight + 20; // Add some padding after the table
}
