const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CompanyRoleSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    role: { type: String, enum: ['Owner', 'Admin', 'Employee'], required: true }
});

module.exports = mongoose.model('Role', CompanyRoleSchema);  