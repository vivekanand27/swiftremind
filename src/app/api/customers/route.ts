import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import { connectDB } from "@/dbconfig/dbconfig";
import { getOrganisationIdFromUser } from "@/utils/organisation";
import jwt from "jsonwebtoken";

// Authentication middleware
const authenticateRequest = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!authHeader || !authHeader.startsWith("Bearer ") || !JWT_SECRET) {
    return { error: NextResponse.json({ message: "Unauthorized - Invalid or missing token" }, { status: 401 }) };
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return { organisationId: decoded.organisationId, role: decoded.role };
  } catch {
    return { error: NextResponse.json({ message: "Unauthorized - Invalid token" }, { status: 401 }) };
  }
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const authResult = await authenticateRequest(req);
    if ('error' in authResult) return authResult.error;
    let organisationId = authResult.organisationId;
    let role = authResult.role;
    const body = await req.json();
    // If superadmin, use organisationId from request body
    if (role === 'superadmin') {
      organisationId = body.organisationId;
    }

    const {
      name, phone, email, address, businessName, gstNumber, alternatePhone, notes,
      pendingAmount, currency, paymentTerms, creditLimit, dueDate,
      customerType, paymentStatus, riskLevel,
      reminderFrequency, preferredContactMethod, autoReminder,
      customFields
    } = body;

    // Validation
    if (!organisationId) {
      return NextResponse.json({ message: "Organisation is required" }, { status: 400 });
    }
    if (!name || !phone) {
      return NextResponse.json({ message: "Name and phone are required" }, { status: 400 });
    }

    // Validate financial fields
    if (pendingAmount && pendingAmount < 0) {
      return NextResponse.json({ message: "Pending amount cannot be negative" }, { status: 400 });
    }

    if (creditLimit && creditLimit < 0) {
      return NextResponse.json({ message: "Credit limit cannot be negative" }, { status: 400 });
    }

    // Check if customer with same phone already exists in this organisation
    const existingCustomer = await Customer.findOne({ 
      organisationId, 
      phone: phone.trim() 
    });
    
    if (existingCustomer) {
      return NextResponse.json({ message: "Customer with this phone number already exists" }, { status: 409 });
    }

    const customer = new Customer({
      organisationId,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      address: address?.trim(),
      businessName: businessName?.trim(),
      gstNumber: gstNumber?.trim(),
      alternatePhone: alternatePhone?.trim(),
      notes: notes?.trim(),
      pendingAmount: pendingAmount || 0,
      currency: currency || "INR",
      paymentTerms: paymentTerms || "Net 30",
      creditLimit: creditLimit || 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      customerType: customerType || "Regular",
      paymentStatus: paymentStatus || "Current",
      riskLevel: riskLevel || "Low",
      reminderFrequency: reminderFrequency || "Weekly",
      preferredContactMethod: preferredContactMethod || "Email",
      autoReminder: autoReminder !== undefined ? autoReminder : true,
      customFields
    });

    await customer.save();
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Authentication check
    const authResult = await authenticateRequest(req);
    if ('error' in authResult) return authResult.error;
    const { organisationId, role } = authResult;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const customerType = searchParams.get("customerType") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    let query: any = {};
    if (role !== 'superadmin') {
      query.organisationId = organisationId;
    }
    // Search functionality
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { businessName: regex },
        { gstNumber: regex }
      ];
    }
    // Filter by payment status
    if (status) {
      query.paymentStatus = status;
    }
    // Filter by customer type
    if (customerType) {
      query.customerType = customerType;
    }
    // Validate sort parameters
    const allowedSortFields = ["name", "pendingAmount", "dueDate", "paymentStatus", "createdAt", "updatedAt"];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const validSortOrder = sortOrder === "asc" ? 1 : -1;
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ [validSortBy]: validSortOrder })
      .skip(skip)
      .limit(limit)
      .lean();
    const pages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({ 
      customers, 
      total, 
      page, 
      pages,
      limit 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 