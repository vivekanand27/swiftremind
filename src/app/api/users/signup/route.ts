import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/dbconfig/dbconfig";
import jwt from "jsonwebtoken";

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
    const { name, email, phone, password, role, organisationId } = await req.json();
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
    // Require organisationId for non-superadmin
    if (role !== 'superadmin' && !organisationId) {
      return NextResponse.json({ message: "Organisation is required for non-superadmin users." }, { status: 400 });
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
    // Determine role: only allow admin to set role, otherwise default to 'user'
    let finalRole = 'user';
    const authHeader = req.headers.get("authorization");
    const JWT_SECRET = process.env.JWT_SECRET;
    if (authHeader && authHeader.startsWith("Bearer ") && JWT_SECRET) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'object' && decoded.role === 'admin' && (role === 'admin' || role === 'user')) {
          finalRole = role;
        }
      } catch {}
    }
    const user = new User({ name, email, phone, password: hashedPassword, userId, role: finalRole, organisationId: finalRole !== 'superadmin' ? organisationId : undefined });
    await user.save();
    return NextResponse.json({ message: "User created successfully." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Signup failed.", error }, { status: 500 });
  }
}
