import mongoose, { Schema, Document } from "mongoose";

export interface IOrganisation extends Document {
  name: string;
  type: string; // 'school', 'shop', etc.
  contactEmail?: string;
  phone?: string;
  city?: string;
  deleted?: boolean;
}

const OrganisationSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  contactEmail: { type: String },
  phone: { type: String },
  city: { type: String },
  deleted: { type: Boolean, default: false },
});

export default mongoose.models.Organisation || mongoose.model<IOrganisation>("Organisation", OrganisationSchema); 