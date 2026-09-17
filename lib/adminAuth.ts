import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/jwt";

// Re-checks the role against the database rather than trusting the JWT alone,
// so a demoted admin loses access immediately instead of waiting for token expiry.
export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  await dbConnect();
  const user = await User.findById(session.userId).select("role");
  if (!user || user.role !== "admin") return null;

  return session;
}
