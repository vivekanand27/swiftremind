import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/Customer";
import { connectDB } from "@/dbconfig/dbconfig";
import { getTenantIdFromUser } from "@/utils/organisation";

export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  await connectDB();
  const organisationId = getTenantIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const customer = await Customer.findOne({ _id: params.customerId, organisationId }).lean();
  if (!customer) return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: { customerId: string } }) {
  await connectDB();
  const organisationId = getTenantIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const update = await req.json();
  const customer = await Customer.findOneAndUpdate({ _id: params.customerId, organisationId }, update, { new: true });
  if (!customer) return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { customerId: string } }) {
  await connectDB();
  const organisationId = getTenantIdFromUser(req);
  if (!organisationId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const customer = await Customer.findOneAndDelete({ _id: params.customerId, organisationId });
  if (!customer) return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  return NextResponse.json({ message: "Customer deleted" }, { status: 200 });
} 