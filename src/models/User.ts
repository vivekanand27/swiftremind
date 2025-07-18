import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  userId: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  userId: { type: Number, unique: true, required: true },
});

export default models.User || mongoose.model<IUser>("User", UserSchema); 