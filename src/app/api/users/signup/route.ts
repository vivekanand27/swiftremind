import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  // Simple phone validation: 10-15 digits
  return /^\d{10,15}$/.test(phone);
}

function validatePassword(password: string) {
  return password.length >= 6;
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || (!email && !phone) || !password) {
      return NextResponse.json({ message: "Name, password, and either email or phone are required." }, { status: 400 });
    }
    if (email && !validateEmail(email)) {
      return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ message: "Invalid phone number format. Enter 10-15 digits." }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }
    // Check for existing user by email or phone
    const existingUser = await User.findOne({ $or: [email ? { email } : {}, phone ? { phone } : {}] });
    if (existingUser) {
      return NextResponse.json({ message: "User with this email or phone already exists." }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate a unique 5-6 digit userId
    let userId;
    let isUnique = false;
    while (!isUnique) {
      userId = Math.floor(10000 + Math.random() * 900000); // 5-6 digit number
      const existingId = await User.findOne({ userId });
      if (!existingId) isUnique = true;
    }
    const user = new User({ name, email, phone, password: hashedPassword, userId });
    await user.save();
    return NextResponse.json({ message: "User created successfully." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Signup failed.", error }, { status: 500 });
  }
}
