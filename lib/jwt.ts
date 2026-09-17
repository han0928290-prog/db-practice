import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
export const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // seconds

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

export function signToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
