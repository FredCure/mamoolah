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
    document.getElementById("purchaseFields").classList.toggle("hidden", type !== "purchase");
    document.getElementById("crPurchaseFields").classList.toggle("hidden", type !== "crPurchase");
    // document.getElementById("expenseFields").classList.toggle("hidden", type !== "expense");
    // document.getElementById("incomeFields").classList.toggle("hidden", type !== "income");
    // document.getElementById("transferFields").classList.toggle("hidden", type !== "transfer");
    // document.getElementById("invoicePaymentFields").classList.toggle("hidden", type !== "invoicePayment");
}

function updateFieldsForSupplier(supplierDropdownId, accountDropdownId, taxesDropdownId) {
    const supplierDropdown = document.getElementById(supplierDropdownId);
    const selectedSupplier = supplierDropdown.options[supplierDropdown.selectedIndex];

    if (!selectedSupplier.value) {
        // Reset both dropdowns if no supplier is selected
        document.getElementById(accountDropdownId).selectedIndex = 0;
        document.getElementById(taxesDropdownId).selectedIndex = 0;
        return;
    }

    const supplierAccountType = selectedSupplier.getAttribute('data-account-type');
    const supplierTaxesType = selectedSupplier.getAttribute('data-taxes-type');

    // Update account dropdown
    const accountDropdown = document.getElementById(accountDropdownId);
    for (let i = 0; i < accountDropdown.options.length; i++) {
        const accountOption = accountDropdown.options[i];
        if (accountOption.value === supplierAccountType) {
            accountOption.selected = true;
            break;
        }
    }

    // Update taxes dropdown
    const taxesDropdown = document.getElementById(taxesDropdownId);
    for (let i = 0; i < taxesDropdown.options.length; i++) {
        const taxOption = taxesDropdown.options[i];
        if (taxOption.value === supplierTaxesType) {
            taxOption.selected = true;
            break;
        }
    }
}