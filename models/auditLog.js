const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object }
});

AuditLogSchema.index({ userId: 1 }, { background: true });
AuditLogSchema.index({ entity: 1 }, { background: true });
AuditLogSchema.index({ entityId: 1 }, { background: true });
AuditLogSchema.index({ timestamp: 1 }, { background: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);