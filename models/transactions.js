const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    bankTransactionId: { type: String, required: true, unique: true },
    transactionDate: { type: Date, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'CAD' },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityType' }, // Generic reference field
    entityType: { type: String, enum: ['Invoice', 'Expense', 'Revenue', 'Transfer'] }, // Type of the referenced entity
    paymentMethod: { type: String, enum: ['bank_transfer', 'credit_card', 'paypal', 'cash'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });


module.exports = mongoose.model('Transaction', TransactionSchema);