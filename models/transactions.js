const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    transactionDate: { type: Date, required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    entries: [{
        accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
        type: { type: String, enum: ['debit', 'credit'], required: true },
        amount: { type: Number, required: true }
    }],
    currency: { type: String, required: true, default: 'CAD' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'paid', 'partial'], required: true, default: 'pending' },
    notes: { type: String },
}, { timestamps: true });


module.exports = mongoose.model('Transaction', TransactionSchema);