const fileInput = document.getElementById('fileInput');
const fileContentDiv = document.getElementById('fileContent');
const customer = document.getElementById('customer');
const customers = document.getElementById('customers');
const date = document.getElementById('date');
const total = document.getElementById('total');
const number = document.getElementById('number');
const automagic = document.getElementById('automagic');
const openingBalance = document.getElementById('openingBalance');

// Set behavior for checking the "Opening Balance" checkbox
openingBalance.addEventListener('change', function () {
    if (openingBalanceCheckbox.checked) {
      // If the checkbox is checked, disable the input and remove the "required" attribute
      number.disabled = true;
      number.removeAttribute('required');
      fileInput.disabled = true;
      fileInput.removeAttribute('required');
    } else {
      // If the checkbox is unchecked, enable the input and add the "required" attribute
      number.disabled = false;
      number.setAttribute('required', 'required');
      fileInput.disabled = false;
      fileInput.setAttribute('required', 'required');
    }
  });

// Set date input field to today's date by default
date.valueAsDate = new Date();


// Store the extracted data
let extractedData = {
    customerName: null,
    invoiceNumber: null,
    total: null
};

// Check the file once it's selected
automagic.addEventListener('click', () => {
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        readAndDisplayFileContent(selectedFile);
    }

});

// Read selected file and display the content
// Also extracts the Invoice data as text
function readAndDisplayFileContent(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
        const fileContent = event.target.result

        const extractedData = extractInvoiceData(fileContent)

        fileContentDiv.innerHTML = extractedData;
        
    }

    reader.readAsText(file);
}

function extractInvoiceData (fileContent) {
    // Extract customer name enclosed in '*' asterisks
    const customerNameMatches = fileContent.match(/\*(.*?)\*/);
    extractedData.customerName = customerNameMatches ? customerNameMatches[1] : null;

    // Extract invoice number prefixed with 'INV_'
    const invoiceNumberMatches = fileContent.match(/INV_(\d+)/);
    extractedData.invoiceNumber = invoiceNumberMatches ? invoiceNumberMatches[1] : null;

    // Extract total value (assuming it's a decimal number)
    const totalMatches = fileContent.match(/(\d+\.\d+)/);
    extractedData.total = totalMatches ? parseFloat(totalMatches[1]) : null;

}

// Handle the confirmation and send the POST request
document.getElementById('confirmButton').addEventListener('click', () => {

    // Check if all required data is available for confirmation
    if (extractedData.customerName && extractedData.invoiceNumber && extractedData.total !== null) {

        // Fill out the inputs with the data from the invoice

        // Find the customer
        const currentCustomer = customers.filter(customer => customer.innerText.toLowerCase() == extractedData.customerName.toLowerCase())

        customer.innerHTML = `value=${currentCustomer.value}`

        total.value = extractedData.total

        number.value = extractedData.invoiceNumber

    }
})

