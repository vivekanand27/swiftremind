import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";
import jwt from "jsonwebtoken";

function getUserFromToken(req: NextRequest, JWT_SECRET?: string): null | (jwt.JwtPayload & { role?: string; id?: string; _id?: string }) {
  if (!JWT_SECRET) return null;
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object') return decoded as jwt.JwtPayload & { role?: string; id?: string; _id?: string };
    return null;
  } catch {
    return null;
  }
}

export async function DELETE(req: NextRequest, context: any) {
  await connectDB();
  const { params } = await context;
  const JWT_SECRET = process.env.JWT_SECRET;
  const decoded = getUserFromToken(req, JWT_SECRET);
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ message: "Forbidden: Admins only." }, { status: 403 });
  }
  const userId = parseInt(params.userId, 10);
  const user = await User.findOneAndUpdate({ userId, deleted: { $ne: true } }, { deleted: true }, { new: true });
  if (!user) {
    return NextResponse.json({ message: "User not found or already deleted." }, { status: 404 });
  }
  return NextResponse.json({ message: "User soft deleted successfully." }, { status: 200 });
}

export async function PATCH(req: NextRequest, context: any) {
  await connectDB();
  const { params } = context;
  const JWT_SECRET = process.env.JWT_SECRET;
  const decoded = getUserFromToken(req, JWT_SECRET);
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ message: "Forbidden: Admins only." }, { status: 403 });
  }
  const userId = parseInt(params.userId, 10);
  const { name, email, phone, role } = await req.json();
  const update: any = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  // Only allow role change if not editing own user
  if (role !== undefined && decoded && String(decoded.id || decoded._id) !== String(userId)) update.role = role;
  const user = await User.findOneAndUpdate({ userId, deleted: { $ne: true } }, update, { new: true });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "User updated successfully.", user }, { status: 200 });
}

export async function GET(req: NextRequest, context: any) {
  await connectDB();
  const { params } = await context;
  const authHeader = req.headers.get("authorization");
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!authHeader || !authHeader.startsWith("Bearer ") || !JWT_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
  const userId = parseInt(params.userId, 10);
  const user = await User.findOne({ userId, deleted: { $ne: true } }).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }
  if (user && typeof user === 'object' && 'password' in user) {
    delete user.password;
  }
  return NextResponse.json({ user }, { status: 200 });
} 