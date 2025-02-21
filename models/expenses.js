const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // Link expense to a supplier
    category: { type: String, required: true }, // e.g., "Office Supplies", "Travel"
    description: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Credit Card', 'Bank Transfer', 'Cash'], required: true },
    expenseDate: { type: Date, required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiptUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);