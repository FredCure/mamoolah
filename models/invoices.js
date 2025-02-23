const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WorkerSchema = new Schema({
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    hours: { type: Number, required: true },
    fixed: { type: Number, required: true },
    subtotal: { type: Number, required: true }
});

const ElementSchema = new Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    fixed: { type: Number, required: true },
    amount: { type: Number, required: true },
    taxes: {
        type: Number,
        enum: [0, 14.975, 5, 9.975, 13],
        required: true
    },
    workers: [WorkerSchema]
});

const InvoiceSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    number: { type: Number, required: true },
    client: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    email: { type: String, required: true },
    date: { type: Date, required: true },
    terms: {
        type: Number,
        enum: [0, 7, 14, 30, 60, 90],
        required: true
    },
    elements: [ElementSchema],
    subtotal: { type: Number, required: true },
    rebateType: { type: String, required: true },
    rebate: { type: Number, required: true },
    gst: { type: Number, required: true },
    pst: { type: Number, required: true },
    hst: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: 'CAD' },
    deposit: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Refunded'], required: true, default: 'Pending' },
    paidAmount: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
}, { timestamps: true });

// Pre-save hook to set the default value of balance to the value of total
InvoiceSchema.pre('save', function (next) {
    if (this.isNew && this.balance === 0) {
        this.balance = this.total;
    }
    next();
});


module.exports = mongoose.model('Invoice', InvoiceSchema);



