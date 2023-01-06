//Module scope variables

const amount = document.getElementById("amount")
const totalApplied = document.getElementById("appliedPayment")
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

//Automatically applies the payment when the amount is entered

function setPayment(e) {
    payAmount = +e.target.value
    paymentLeft = payAmount
    document.getElementsByName("invoices").forEach(el => {
        // console.log(el)
        el.disabled = false
        applyPayment(el, false)

    })

    // Adds the unapplied credit to the form
    addUnappliedCredit()

}

// if the checkboxes are clicked after the amount is entered, this function checks whether they are being checked or unchecked and executes the appropriate function

function checkboxHandler(e) {
    const invoice = document.getElementById(e.target.id)
    const checkbox = invoice.querySelector("input")
    // console.log(checkbox.checked)
    if (checkbox.checked) {
        applyPayment(checkbox, true)
    } else {
        unapplyPayment(checkbox)
    }
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
