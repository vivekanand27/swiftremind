import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  organisationId?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

const AuditLogSchema = new Schema({
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  organisationId: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema); 