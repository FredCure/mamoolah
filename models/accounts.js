const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    accountName: { type: String, required: true },
    accountType: { type: String },
    institution: { type: String },
    accountNumber: { type: String },
    currency: { type: String },
    balance: { type: Number },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    createdAt: { type: Date },
    updatedAt: { type: Date }
});

module.exports = mongoose.model('Account', AccountSchema);