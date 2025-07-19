import mongoose, { Schema, Document } from "mongoose";

export interface IReminder extends Document {
  organisationId: string;
  customerId: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "cancelled";
  notes?: string;
}

const ReminderSchema = new Schema({
  organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
  notes: { type: String }
});

export default mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", ReminderSchema); 