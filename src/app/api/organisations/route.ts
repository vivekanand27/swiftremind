import { NextRequest, NextResponse } from "next/server";
import Organisation from "@/models/Organisation";
import { connectDB } from "@/dbconfig/dbconfig";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, type, contactEmail, phone, city } = await req.json();
  const organisation = new Organisation({ name, type, contactEmail, phone, city });
  await organisation.save();
  return NextResponse.json({ organisation }, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const total = await Organisation.countDocuments({ deleted: { $ne: true } });
  const organisations = await Organisation.find({ deleted: { $ne: true } })
    .skip(skip)
    .limit(limit)
    .lean();
  const pages = Math.max(1, Math.ceil(total / limit));
  return NextResponse.json({ organisations, total, page, pages }, { status: 200 });
} 