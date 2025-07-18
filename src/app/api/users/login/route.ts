import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";

export async function POST(req: Request) {
  await connectDB();
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }
    // You can add JWT or session logic here if needed
    return NextResponse.json({ message: "Login successful." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Login failed.", error }, { status: 500 });
  }
}
