const mongoose = require('mongoose');
const invoices = require('./invoices');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    clientName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    cell: { type: String },
    fax: { type: String },
    email: { type: String },
    taxes: { type: String, enum: ['null', 'exempt', 'gst', 'gstpst', 'pst', 'hst'], required: true, default: 'gstpst' },
    terms: { type: Number, enum: [0, 7, 14, 30, 60, 90], required: true },
    salesRep: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceStreet: { type: String },
    invoiceCity: { type: String },
    invoiceState: { type: String },
    invoiceCode: { type: String },
    invoiceCountry: { type: String },
    shipStreet: { type: String },
    shipCity: { type: String },
    shipState: { type: String },
    shipCode: { type: String },
    shipCountry: { type: String },
    createdAt: { type: Date, default: Date.now },
    invoices: [{
        type: Schema.Types.ObjectId,
        ref: 'Invoice'
    }]
});

module.exports = mongoose.model('Client', ClientSchema);