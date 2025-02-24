const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    name: { type: String, required: true },
    logo: { type: String },
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date },
    compNumber: { type: Number },
    compType: { type: String },
    compStreet: { type: String },
    compCity: { type: String },
    compState: { type: String },
    compCode: { type: String },
    compCountry: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    gstNumber: { type: String },
    pstNumber: { type: String },
    hstNumber: { type: String },
    gstRate: { type: Number },
    pstRate: { type: Number },
    hstRate: { type: Number },
    currentInvoiceNumber: { type: Number, default: 1 },
    invoiceNumberPrefix: { type: String },
});

CompanySchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Company', CompanySchema);