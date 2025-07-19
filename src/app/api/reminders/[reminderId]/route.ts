import { NextRequest, NextResponse } from "next/server";
import Reminder from "@/models/Reminder";
import { connectDB } from "@/dbconfig/dbconfig";
import { getOrganisationIdFromUser } from "@/utils/organisation";

export async function GET(req: NextRequest, { params }: { params: { reminderId: string } }) {
  await connectDB();
  const organisationId = getOrganisationIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const reminder = await Reminder.findOne({ _id: params.reminderId, organisationId }).lean();
  if (!reminder) return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
  return NextResponse.json({ reminder }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: { reminderId: string } }) {
  await connectDB();
  const organisationId = getOrganisationIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const update = await req.json();
  const reminder = await Reminder.findOneAndUpdate({ _id: params.reminderId, organisationId }, update, { new: true });
  if (!reminder) return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
  return NextResponse.json({ reminder }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { reminderId: string } }) {
  await connectDB();
  const organisationId = getOrganisationIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const reminder = await Reminder.findOneAndDelete({ _id: params.reminderId, organisationId });
  if (!reminder) return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
  return NextResponse.json({ message: "Reminder deleted" }, { status: 200 });
} 