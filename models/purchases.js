const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true }, // Inventory Account
    invoiceNumber: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
}, { timestamps: true });


module.exports = mongoose.model('Purchase', PurchaseSchema);