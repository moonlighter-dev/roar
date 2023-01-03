const amount = document.getElementById("amount")
const totalApplied = document.getElementById("appliedPayment")
let payAmount = 0.00
let paymentLeft = 0.00

if (amount){
    amount.addEventListener(
        'change',
        setPayment,
        false
    )    
}

function setPayment(e) {
    payAmount = +e.target.value
    paymentLeft = payAmount
    document.getElementsByName("invoices").forEach(el => {
        // console.log(el)
        el.disabled = false
        applyPayment(el)

    })
}

function checkboxHandler(e) {
    const invoice = document.getElementById(e.target.id)
    const checkbox = invoice.querySelector("input")
    // console.log(checkbox.checked)
    if (checkbox.checked) {
        applyPayment(checkbox)
    } else {
        unapplyPayment(checkbox)
    }
}

function applyPayment(invoice) {

    const currentRow = document.getElementById(invoice.id)
    const dueAmount = +currentRow.querySelector(".due").textContent.trim().slice(2)
    const paid = currentRow.querySelector(".paid")
    
    if (paymentLeft >= dueAmount) {
        invoice.checked = true
        paymentLeft -= dueAmount
        paid.textContent = `$ ${dueAmount.toFixed(2)}`
    } else if (paymentLeft > 0) {
        invoice.checked = true
        paid.textContent = `$ ${paymentLeft.toFixed(2)}`
        paymentLeft = 0.00
    } else {
        invoice.checked = false
        paid.textContent = "$ 0.00"
    }
    let applied = payAmount - paymentLeft
    totalApplied.textContent = `$ ${applied.toFixed(2)}`

}

function unapplyPayment(invoice) {
    const currentRow = document.getElementById(invoice.id)
    const paid = currentRow.querySelector(".paid")

    paymentLeft += +paid.textContent.trim().slice(2)
    paid.textContent = "$ 0.00"

    let applied = payAmount - paymentLeft
    totalApplied.textContent = `$ ${applied.toFixed(2)}`

    // console.log(paymentLeft)

}


// customer.credit += payAmount (what's left)

// sending to backend: invoice.id, payAmount (leftover), payment data(date, ref, tender, amount, customer), invoice.isPaid (to update)

// newDue, overDueUpdate, unappliedCredit