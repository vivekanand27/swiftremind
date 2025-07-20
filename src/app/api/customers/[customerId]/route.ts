import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import { connectDB } from "@/dbconfig/dbconfig";
import { getOrganisationIdFromUser } from "@/utils/organisation";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";

// Authentication middleware
const authenticateRequest = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  const JWT_SECRET = process.env.JWT_SECRET;
  let organisationId: string | undefined = getOrganisationIdFromUser(req) || undefined;
  let role = undefined;
  if (authHeader && JWT_SECRET) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded: any = require("jsonwebtoken").verify(token, JWT_SECRET);
      role = decoded.role;
      // For superadmin, do not require organisationId
      if (role === 'superadmin') {
        organisationId = undefined;
      }
    } catch {}
  }
  if (!organisationId && role !== 'superadmin') {
    return { error: NextResponse.json({ message: "Unauthorized - Invalid or missing token" }, { status: 401 }) };
  }
  return { organisationId, role };
};

// Authorization check - ensure customer belongs to user's organisation
const authorizeCustomerAccess = async (customerId: string, organisationId: string | undefined, role?: string) => {
  let query: any = { _id: customerId };
  if (role !== 'superadmin') {
    query.organisationId = organisationId;
  }
  // Only filter out deleted for non-admins
  if (role !== 'admin' && role !== 'superadmin') {
    query.deleted = false;
  }
  const customer = await Customer.findOne(query).lean();
  if (!customer) {
    return { error: NextResponse.json({ message: "Customer not found" }, { status: 404 }) };
  }
  return { customer };
};

export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    await connectDB();
    
    // Authentication check
    const authResult = await authenticateRequest(req);
    if ('error' in authResult) return authResult.error;
    const { organisationId, role } = authResult;

    // Authorization check
    const authCustomerResult = await authorizeCustomerAccess(params.customerId, organisationId, role);
    if ('error' in authCustomerResult) return authCustomerResult.error;
    const { customer } = authCustomerResult;

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    await connectDB();
    // Authentication check
    const authResult = await authenticateRequest(req);
    if ('error' in authResult) return authResult.error;
    const { organisationId } = authResult;
    // Authorization check
    const authCustomerResult = await authorizeCustomerAccess(params.customerId, organisationId);
    if ('error' in authCustomerResult) return authCustomerResult.error;
    // Get user info for audit log
    const authHeader = req.headers.get("authorization");
    const JWT_SECRET = process.env.JWT_SECRET;
    let userName = "Unknown", userId = "";
    if (authHeader && JWT_SECRET) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded: any = require("jsonwebtoken").verify(token, JWT_SECRET);
        userId = decoded.id || decoded._id || decoded.userId || "";
        userName = decoded.name || decoded.email || decoded.phone || "Unknown";
      } catch {}
    }
    const updateData = await req.json();
    let customer;
    // If restoring (undo delete)
    if (Object.keys(updateData).length === 1 && updateData.deleted === false) {
      customer = await Customer.findOneAndUpdate(
        { _id: params.customerId, organisationId },
        { deleted: false },
        { new: true }
      );
      await AuditLog.create({
        action: "restore",
        entity: "Customer",
        entityId: params.customerId,
        userId,
        userName,
        organisationId,
        details: { customerName: customer?.name }
      });
      return NextResponse.json({ message: "Customer restored successfully", customer }, { status: 200 });
    }
    // Otherwise, treat as update
    // Validate financial fields
    if (updateData.pendingAmount !== undefined && updateData.pendingAmount < 0) {
      return NextResponse.json({ message: "Pending amount cannot be negative" }, { status: 400 });
    }
    if (updateData.creditLimit !== undefined && updateData.creditLimit < 0) {
      return NextResponse.json({ message: "Credit limit cannot be negative" }, { status: 400 });
    }
    // Check for duplicate phone if phone is being updated
    if (updateData.phone) {
      const existingCustomer = await Customer.findOne({ 
        organisationId, 
        phone: updateData.phone.trim(),
        _id: { $ne: params.customerId } // Exclude current customer
      });
      if (existingCustomer) {
        return NextResponse.json({ message: "Customer with this phone number already exists" }, { status: 409 });
      }
    }
    // Handle payment history updates
    if (updateData.paymentHistory) {
      for (const payment of updateData.paymentHistory) {
        if (!payment.date || !payment.amount || !payment.method) {
          return NextResponse.json({ message: "Payment history entries must have date, amount, and method" }, { status: 400 });
        }
        if (payment.amount <= 0) {
          return NextResponse.json({ message: "Payment amount must be positive" }, { status: 400 });
        }
      }
    }
    // Update payment status based on pending amount and due date
    if (updateData.pendingAmount !== undefined || updateData.dueDate !== undefined) {
      const currentCustomer = await Customer.findById(params.customerId);
      const pendingAmount = updateData.pendingAmount !== undefined ? updateData.pendingAmount : currentCustomer.pendingAmount;
      const dueDate = updateData.dueDate !== undefined ? new Date(updateData.dueDate) : currentCustomer.dueDate;
      if (pendingAmount === 0) {
        updateData.paymentStatus = "Paid";
      } else if (dueDate && new Date() > dueDate) {
        updateData.paymentStatus = "Overdue";
      } else if (pendingAmount > 0) {
        updateData.paymentStatus = "Current";
      }
    }
    customer = await Customer.findOneAndUpdate(
      { _id: params.customerId, organisationId },
      updateData,
      { new: true, runValidators: true }
    );
    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Error updating/restoring customer:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    await connectDB();
    // Authentication check
    const authResult = await authenticateRequest(req);
    if ('error' in authResult) return authResult.error;
    const { organisationId } = authResult;
    // Authorization check
    const authCustomerResult = await authorizeCustomerAccess(params.customerId, organisationId);
    if ('error' in authCustomerResult) return authCustomerResult.error;
    // Get user info for audit log
    const authHeader = req.headers.get("authorization");
    const JWT_SECRET = process.env.JWT_SECRET;
    let userName = "Unknown", userId = "";
    if (authHeader && JWT_SECRET) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded: any = require("jsonwebtoken").verify(token, JWT_SECRET);
        userId = decoded.id || decoded._id || decoded.userId || "";
        userName = decoded.name || decoded.email || decoded.phone || "Unknown";
      } catch {}
    }
    // Soft delete
    const customer = await Customer.findOneAndUpdate(
      { _id: params.customerId, organisationId },
      { deleted: true },
      { new: true }
    );
    // Save audit log
    await AuditLog.create({
      action: "delete",
      entity: "Customer",
      entityId: params.customerId,
      userId,
      userName,
      organisationId,
      details: { customerName: customer?.name }
    });
    return NextResponse.json({ message: "Customer deleted successfully", customer }, { status: 200 });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 