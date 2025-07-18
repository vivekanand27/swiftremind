import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!authHeader || !authHeader.startsWith("Bearer ") || !JWT_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
  await connectDB();
  const userId = decoded.id || decoded._id;
  const user = await User.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  delete user.password;
  return NextResponse.json({ user }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get("authorization");
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!authHeader || !authHeader.startsWith("Bearer ") || !JWT_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
  const userId = decoded.id || decoded._id;
  if (!userId) {
    return NextResponse.json({ message: "User not found in token." }, { status: 400 });
  }
  const { name, email, phone, password } = await req.json();
  const update: any = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (phone) update.phone = phone;
  if (password) update.password = await bcrypt.hash(password, 10);
  try {
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Profile updated successfully.", user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Failed to update profile.", error: err }, { status: 500 });
  }
} 