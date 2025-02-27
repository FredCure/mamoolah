const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InviteSchema = new Schema({
    companyId: { type: mongoose.Types.ObjectId, required: true, ref: 'Company' },
    email: { type: String, required: true },
    role: { type: String, enum: ['Owner', 'Admin', 'Employee'], required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Invite', InviteSchema);