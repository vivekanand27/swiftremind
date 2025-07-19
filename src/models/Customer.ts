import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  organisationId: string;
  name: string;
  phone: string;
  email?: string;
  customFields?: Record<string, any>;
}

const CustomerSchema = new Schema({
  organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  customFields: { type: Object }
});

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema); 