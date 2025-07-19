import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'superadmin' | 'admin' | 'user';
  organisationId?: string;
  deleted?: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  userId: { type: Number, unique: true, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user', required: true },
  deleted: { type: Boolean, default: false },
});

export default models.User || mongoose.model<IUser>("User", UserSchema); 