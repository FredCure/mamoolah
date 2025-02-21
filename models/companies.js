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
    email: { type: String },
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
    mainAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
});

module.exports = mongoose.model('Company', CompanySchema);


// compName: { type: String, required: true },
// publicEmail: { type: String, required: true },
// compStreet: { type: String, required: true },
// compCity: { type: String, required: true },
// compState: { type: String, required: true },
// compCode: { type: String, required: true },
// compCountry: { type: String, required: true },
// publicStreet: { type: String, required: true },
// publicCity: { type: String, required: true },
// publicState: { type: String, required: true },
// publicCode: { type: String, required: true },
// publicCountry: { type: String, required: true },
// legalStreet: { type: String, required: true },
// legalCity: { type: String, required: true },
// legalState: { type: String, required: true },
// legalCode: { type: String, required: true },
// legalCountry: { type: String, required: true },
// gstNumber: { type: String, required: true },
// pstNumber: { type: String, required: true },
// hstNumber: { type: String, required: true },



// const WorkerSchema = new Schema({
//     name: { type: String, required: true },
//     rate: { type: Number, required: true },
//     hours: { type: Number, required: true },
//     fixed: { type: Number, required: true },
//     subtotal: { type: Number, required: true }
// });

// const ElementSchema = new Schema({
//     date: { type: Date, required: true },
//     description: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     rate: { type: Number, required: true },
//     fixed: { type: Number, required: true },
//     amount: { type: Number, required: true },
//     taxes: {
//         type: Number,
//         enum: [0, 14.975, 5, 9.975, 13],
//         required: true
//     },
//     workers: [WorkerSchema]
// });

// const InvoiceSchema = new Schema({
//     number: { type: Number, required: true },
//     client: { type: String, required: true },
//     clientId: { type: String, required: true },
//     email: { type: String, required: true },
//     date: { type: Date, required: true },
//     terms: {
//         type: Number,
//         enum: [0, 7, 14, 30, 60, 90],
//         required: true
//     },
//     elements: [ElementSchema],
//     subtotal: { type: Number, required: true },
//     rebateType: { type: String, required: true },
//     rebate: { type: Number, required: true },
//     gst: { type: Number, required: true },
//     pst: { type: Number, required: true },
//     hst: { type: Number, required: true },
//     total: { type: Number, required: true },
//     deposit: { type: Number, required: true }
// });