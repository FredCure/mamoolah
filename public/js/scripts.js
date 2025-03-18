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