const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InviteSchema = new Schema({
    companyId: { type: mongoose.Types.ObjectId, required: true, ref: 'Company' },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invite', InviteSchema);