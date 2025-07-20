import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  organisationId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  businessName?: string;
  gstNumber?: string;
  alternatePhone?: string;
  notes?: string;
  
  // Financial Information
  pendingAmount: number;
  currency: string;
  paymentTerms: string;
  creditLimit: number;
  
  // Transaction Details
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  dueDate?: Date;
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
  }>;
  
  // Customer Classification
  customerType: string;
  paymentStatus: string;
  riskLevel: string;
  
  // Reminder Settings
  reminderFrequency: string;
  preferredContactMethod: string;
  autoReminder: boolean;
  
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // cash, bank transfer, cheque, online
  reference: { type: String },
  notes: { type: String }
});

const CustomerSchema = new Schema({
  organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  businessName: { type: String },
  gstNumber: { type: String },
  alternatePhone: { type: String },
  notes: { type: String },
  
  // Financial Information
  pendingAmount: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "INR" },
  paymentTerms: { type: String, default: "Net 30" },
  creditLimit: { type: Number, default: 0, min: 0 },
  
  // Transaction Details
  lastPaymentDate: { type: Date },
  lastPaymentAmount: { type: Number, min: 0 },
  dueDate: { type: Date },
  paymentHistory: [PaymentHistorySchema],
  
  // Customer Classification
  customerType: { 
    type: String, 
    enum: ["Regular", "VIP", "Wholesale", "Retail", "Corporate"],
    default: "Regular"
  },
  paymentStatus: { 
    type: String, 
    enum: ["Current", "Overdue", "Paid", "Delinquent"],
    default: "Current"
  },
  riskLevel: { 
    type: String, 
    enum: ["Low", "Medium", "High"],
    default: "Low"
  },
  
  // Reminder Settings
  reminderFrequency: { 
    type: String, 
    enum: ["Daily", "Weekly", "Monthly", "Never"],
    default: "Weekly"
  },
  preferredContactMethod: { 
    type: String, 
    enum: ["Email", "SMS", "Phone", "WhatsApp"],
    default: "Email"
  },
  autoReminder: { type: Boolean, default: true },
  
  customFields: { type: Object },
  deleted: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Index for better query performance
CustomerSchema.index({ organisationId: 1, paymentStatus: 1 });
CustomerSchema.index({ organisationId: 1, dueDate: 1 });
CustomerSchema.index({ organisationId: 1, pendingAmount: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema); 