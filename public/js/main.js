//Module scope variables

const amount = document.getElementById("amount")
const totalApplied = document.getElementById("appliedPayment")
const total = document.getElementById("total")
const summary = document.getElementById("summary")
let payAmount = 0.00
let paymentLeft = 0.00

//Event listener for when the amount paid changes

if (amount){
    amount.addEventListener(
        'change',
        setPayment,
        false
    )    
}

//Event listener for when there is a total of finance charges
if (total){
    summaryToast.hidden = false
    summary.textContent = `$${total} will be charged to customers.`
}

//Automatically applies the payment when the amount is entered

function setPayment(e) {
    payAmount = +e.target.value
    paymentLeft = payAmount
    const invoices = document.getElementsByName("invoices")
    
    invoices.forEach(el => {
        // console.log(el)
        el.disabled = false
        applyPayment(el, false)

    })

      // Check if there's credit left and show a message
    if (paymentLeft > 0) {
        document.getElementById("creditToast").hidden = false;
        document.getElementById("credit").textContent = `${paymentLeft.toFixed(2)} will be applied to the account as a customer credit`;
    } else {
        document.getElementById("creditToast").hidden = true;
    }
}

// Function to handle checkbox changes

function checkboxHandler(e) {
    const invoice = document.getElementById(e.target.id)
    const checkbox = invoice.querySelector("input")
    checkbox.checked ? applyPayment(checkbox, true) : unapplyPayment(checkbox);
}

//this function is for when a payment is applied and updates the table

function applyPayment(invoice, manual) {

    const currentRow = document.getElementById(invoice.id)
    const dueAmount = +currentRow.querySelector(".due").value
    const paid = currentRow.querySelector(".paid")
    
    if (paymentLeft >= dueAmount) {
        invoice.checked = true
        paymentLeft -= dueAmount
        paid.value = `${dueAmount.toFixed(2)}`
    } else if (paymentLeft > 0) {
        invoice.checked = true
        paid.value = `${paymentLeft.toFixed(2)}`
        paymentLeft = 0.00
    } else {
        invoice.checked = false
        paid.value = "0.00"
        if (manual) {
            alert("There's no payment left to apply")            
        }
    }
    
    updateApplied()
}

// function to unapply payment
function unapplyPayment(invoice) {
    const currentRow = document.getElementById(invoice.id)
    const paid = currentRow.querySelector(".paid")

    paymentLeft += +paid.value.trim()
    paid.value = "0.00"

    updateApplied()
}

function updateApplied() {
    let applied = payAmount - paymentLeft
    totalApplied.value = `${applied.toFixed(2)}`
}
