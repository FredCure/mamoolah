const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    bankTransactionId: { type: String, required: true, unique: true },
    transactionDate: { type: Date, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'CAD' },
    paymentMethod: { type: String, enum: ['bank_transfer', 'credit_card', 'paypal', 'cash'], required: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });


module.exports = mongoose.model('Transaction', TransactionSchema);