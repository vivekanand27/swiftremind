import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import { connectDB } from "@/dbconfig/dbconfig";
import { getOrganisationIdFromUser } from "@/utils/organisation";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, phone, email, customFields } = await req.json();
  const organisationId = getOrganisationIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const customer = new Customer({ organisationId, name, phone, email, customFields });
  await customer.save();
  return NextResponse.json({ customer }, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const organisationId = getOrganisationIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  let query: any = { organisationId };
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { name: regex },
      { phone: regex },
      { email: regex }
    ];
  }
  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .skip(skip)
    .limit(limit)
    .lean();
  const pages = Math.max(1, Math.ceil(total / limit));
  return NextResponse.json({ customers, total, page, pages }, { status: 200 });
} 