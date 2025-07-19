import mongoose from "mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/yourdbname";
const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@swiftremind.com";
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
    await User.create({
      name: "Admin",
      email: defaultAdminEmail,
      password: hashedPassword,
      userId: 1,
      role: "admin",
      deleted: false,
    });
    console.log(`Default admin user created: ${defaultAdminEmail} / ${defaultAdminPassword}`);
  } else {
    console.log("Admin user already exists.");
  }
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
}); 