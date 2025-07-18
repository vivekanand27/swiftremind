import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";
import jwt from "jsonwebtoken";

export async function DELETE(req: NextRequest, context: any) {
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
  const user = await User.findOneAndDelete({ userId });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "User deleted successfully." }, { status: 200 });
} 