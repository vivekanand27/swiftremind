import { NextRequest, NextResponse } from "next/server";
import Organisation from "@/models/Organisation";
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
    if (decoded.role === "superadmin") {
      return { role: "superadmin" };
    }
    if (!decoded.organisationId) {
      return { error: NextResponse.json({ message: "Unauthorized - No organisationId" }, { status: 401 }) };
    }
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
    // Only superadmin can create organisations
    if (authResult.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden - Only superadmin can create organisations" }, { status: 403 });
    }

    const { name, type, contactEmail, phone, city } = await req.json();
    
    // Validation
    if (!name || !type) {
      return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
    }

    const organisation = new Organisation({ name, type, contactEmail, phone, city });
    await organisation.save();
    return NextResponse.json({ organisation }, { status: 201 });
  } catch (error) {
    console.error("Error creating organisation:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Authentication check
    const authResult = await authenticateRequest(req);
    if ('error' in authResult) return authResult.error;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    let query: any = { deleted: { $ne: true } };
    if (authResult.role === "admin") {
      // Admins can only view their own organisation
      query._id = authResult.organisationId;
    } else if (authResult.role !== "superadmin") {
      // Other roles forbidden
      return NextResponse.json({ message: "Forbidden - Only superadmin or admin can view organisations" }, { status: 403 });
    }
    const total = await Organisation.countDocuments(query);
    const organisations = await Organisation.find(query)
      .skip(skip)
      .limit(limit)
      .lean();
    const pages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({ organisations, total, page, pages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organisations:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 