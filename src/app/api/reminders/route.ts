import { NextRequest, NextResponse } from "next/server";
import Reminder from "@/models/Reminder";
import { connectDB } from "@/dbconfig/dbconfig";
import { getOrganisationIdFromUser } from "@/utils/organisation";

export async function POST(req: NextRequest) {
  await connectDB();
  const { customerId, amount, dueDate, notes } = await req.json();
  const organisationId = getOrganisationIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const reminder = new Reminder({ organisationId, customerId, amount, dueDate, notes });
  await reminder.save();
  return NextResponse.json({ reminder }, { status: 201 });
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
      { notes: regex }
    ];
  }
  const total = await Reminder.countDocuments(query);
  const reminders = await Reminder.find(query)
    .skip(skip)
    .limit(limit)
    .lean();
  const pages = Math.max(1, Math.ceil(total / limit));
  return NextResponse.json({ reminders, total, page, pages }, { status: 200 });
} 