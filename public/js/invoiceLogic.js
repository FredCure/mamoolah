function addElementRow() {
    const table = document.getElementById('elementsTable');
    const row = table.insertRow();
    row.innerHTML = `
            <td><input type="date" class="form-control" name="elements[date][]" required></td>
            <td><input type="text" class="form-control" name="elements[description][]" required></td>
            <td><input type="number" step="0.25" class="form-control" name="elements[quantity][]" value="0" required oninput="updateAmount(this)"></td>
            <td><input type="number" step="0.01" class="form-control" name="elements[rate][]" required value="55" oninput="updateAmount(this)"></td>
            <td><input type="number" step="0.01" class="form-control" name="elements[fixed][]" required value="0" oninput="updateAmount(this)"></td>
            <td><input type="number" class="form-control" name="elements[amount][]" required readonly onchange="updateSubtotal()"></td>
            <td>
                <select class="form-control" name="elements[taxes][]" required oninput="updateAmount(this)">
                <option value="0">N/A</option>
                <option value="14.975" selected>GST/PST</option>
                <option value="5">GST</option>
                <option value="9.975">PST</option>
                <option value="13">HST</option>
                </select>
            </td>
            <td><button  class="btn btn-outline-info-subtle bg-info-subtle" onclick="removeElementRow(this)"><img src="/images/people.svg" alt="People icon" height="16"></button></td>
            <td><button  class="btn btn-outline-info-subtle bg-info-subtle" onclick="removeElementRow(this)"><img src="/images/bin.svg" alt="Bin icon" height="16"></button></td>
        `;
}

function removeElementRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateSubtotal();
}

function updateAmount(input) {
    const row = input.parentNode.parentNode;
    const quantity = parseFloat(row.cells[2].children[0].value) || 0;
    const rate = parseFloat(row.cells[3].children[0].value) || 0;
    const fixed = parseFloat(row.cells[4].children[0].value) || 0;
    const taxes = parseFloat(row.cells[6].children[0].value) || 0;
    const amount = quantity * rate + fixed;
    row.cells[5].children[0].value = amount.toFixed(2);
    updateSubtotal();
}

function updateSubtotal() {
    const table = document.getElementById('elementsTable');
    let subtotal = 0;
    let gst = 0;
    let pst = 0;
    let hst = 0;

    const rebateType = document.getElementById('rebateType').value;
    const rebateValue = parseFloat(document.getElementById('rebate').value) || 0;

    for (let i = 1, row; row = table.rows[i]; i++) {
        let amount = parseFloat(row.cells[5].children[0].value) || 0;
        const tax = parseFloat(row.cells[6].children[0].value) || 0;

        // Apply rebate to the amount
        if (rebateType === 'percentage') {
            amount -= amount * (rebateValue / 100);
        } else {
            amount -= rebateValue / (table.rows.length - 1); // evenly distribute fixed rebate
        }

        subtotal += amount;

        // Calculate taxes on the rebated amount
        if (tax === 5) {
            gst += amount * (tax / 100);
        } else if (tax === 9.975) {
            pst += amount * (tax / 100);
        } else if (tax === 13) {
            hst += amount * (tax / 100);
        } else if (tax === 14.975) {
            gst += (amount * (5 / 100));
            pst += (amount * (9.975 / 100));
        }
    }

    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('gst').value = gst.toFixed(2);
    document.getElementById('pst').value = pst.toFixed(2);
    document.getElementById('hst').value = hst.toFixed(2);

    const total = subtotal + gst + pst + hst;
    document.getElementById('total').value = total.toFixed(2);
}