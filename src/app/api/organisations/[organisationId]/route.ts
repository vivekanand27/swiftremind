import { NextRequest, NextResponse } from "next/server";
import Organisation from "@/models/Organisation";
import { connectDB } from "@/dbconfig/dbconfig";

export async function GET(req: NextRequest, context: { params: { organisationId: string } }) {
  await connectDB();
  const { params } = context;
  const organisation = await Organisation.findById(params.organisationId).lean();
  if (!organisation) return NextResponse.json({ message: "Organisation not found" }, { status: 404 });
  return NextResponse.json({ organisation }, { status: 200 });
}

export async function PATCH(req: NextRequest, context: { params: { organisationId: string } }) {
  await connectDB();
  const { params } = context;
  const update = await req.json();
  const organisation = await Organisation.findByIdAndUpdate(params.organisationId, update, { new: true });
  if (!organisation) return NextResponse.json({ message: "Organisation not found" }, { status: 404 });
  return NextResponse.json({ organisation }, { status: 200 });
}

export async function DELETE(req: NextRequest, context: { params: { organisationId: string } }) {
  await connectDB();
  const { params } = context;
  const organisation = await Organisation.findByIdAndUpdate(params.organisationId, { deleted: true }, { new: true });
  if (!organisation) return NextResponse.json({ message: "Organisation not found" }, { status: 404 });
  return NextResponse.json({ message: "Organisation soft deleted" }, { status: 200 });
} 