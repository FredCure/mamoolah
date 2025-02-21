const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupplierSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', SupplierSchema);