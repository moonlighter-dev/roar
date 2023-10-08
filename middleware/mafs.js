module.exports = {
    convertValueToSixDigitString: (value) => {
        const number = value.toString();
        const leadingZeros = number.padStart(6 - number.length, '0');
        return leadingZeros;
    },
    isWithin30Days: (currentDate, transactionDate) => {
        // if the current date input is a string, it turns it to a date. otherwise it keeps the date
        const today =  typeof(currentDate) != "Date" ? this.changeStringToDate(currentDate) : currentDate

        const targetDate = typeof(transactionDate) != "Date" ? this.changeStringToDate(transactionDate) : transactionDate

        const timeDifferenceMs = today - targetDate;
        const daysDifference = timeDifferenceMs / (1000 * 3600 * 24)
        return daysDifference < 30
      },
    changeStringToDate: (date) => {
        const dateStr = date
        return new Date(dateStr)
    },
}

