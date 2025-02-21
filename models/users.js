const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    cell: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    code: { type: String },
    country: { type: String },
    email: { type: String, required: true, unique: true },
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }], // Companies user is associated with
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }], // Roles in companies
    createdAt: { type: Date, required: true, default: () => new Date().toISOString() },
    defaultCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
