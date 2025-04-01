const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupplierSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    accountType: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    taxes: { type: String, enum: ['null', 'exempt', 'gst', 'gstpst', 'pst', 'hst'], required: true, default: 'gstpst' },
    name: { type: String, required: true },
    contact: { type: String },
    email: { type: String },
    website: { type: String },
    phone: { type: String },
    cell: { type: String },
    fax: { type: String },
    notes: { type: String },
    chequeName: { type: String },
    addressStreet: { type: String },
    addressCity: { type: String },
    addressState: { type: String },
    addressCode: { type: String },
    addressCountry: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);