function sortTable(columnIndex) {
    const table = document.getElementById("accountsTable");
    const rows = Array.from(table.rows).slice(1);
    const sortedRows = rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].innerText.toLowerCase();
        const cellB = b.cells[columnIndex].innerText.toLowerCase();
        return cellA.localeCompare(cellB);
    });
    sortedRows.forEach(row => table.appendChild(row));
}

function toggleFields() {
    let type = document.getElementById("transactionType").value;
    document.getElementById("expenseFields").classList.toggle("hidden", type !== "expense");
    document.getElementById("incomeFields").classList.toggle("hidden", type !== "income");
    document.getElementById("transferFields").classList.toggle("hidden", type !== "transfer");
    document.getElementById("invoicePaymentFields").classList.toggle("hidden", type !== "invoicePayment");
}