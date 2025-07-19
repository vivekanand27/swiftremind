import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export function getOrganisationIdFromUser(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!authHeader || !authHeader.startsWith("Bearer ") || !JWT_SECRET) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.organisationId || null;
  } catch {
    return null;
  }
} 