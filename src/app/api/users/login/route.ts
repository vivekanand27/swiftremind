import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();
  try {
    const { email, phone, password } = await req.json();
    if ((!email && !phone) || !password) {
      return NextResponse.json({ message: "Email or phone and password are required." }, { status: 400 });
    }
    const user = await User.findOne(email ? { email } : { phone });
    if (!user) {
      return NextResponse.json({ message: "Invalid email/phone or password." }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email/phone or password." }, { status: 401 });
    }
    // JWT logic
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in environment variables.");
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Return token in response body
    return NextResponse.json({ message: "Login successful.", token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Login failed.", error }, { status: 500 });
  }
}
