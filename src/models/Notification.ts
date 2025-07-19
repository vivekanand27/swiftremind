import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  organisationId: string;
  reminderId: string;
  customerId: string;
  sentAt: Date;
  channel: "sms" | "email";
  status: "sent" | "failed";
}

const NotificationSchema = new Schema({
  organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  reminderId: { type: Schema.Types.ObjectId, ref: "Reminder", required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  sentAt: { type: Date, default: Date.now },
  channel: { type: String, enum: ["sms", "email"], required: true },
  status: { type: String, enum: ["sent", "failed"], required: true }
});

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema); 