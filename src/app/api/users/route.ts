import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  await connectDB();
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
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  let query: any = {};
  if (search) {
    const regex = new RegExp(search, "i");
    query = {
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    };
  }
  const total = await User.countDocuments(query);
  const users = await User.find(query, { userId: 1, name: 1, email: 1, phone: 1, _id: 0 })
    .sort({ userId: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const pages = Math.max(1, Math.ceil(total / limit));
  return NextResponse.json({ users, total, page, pages }, { status: 200 });
} 