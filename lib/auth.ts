import crypto from "crypto";
import { cookies } from "next/headers";
import { User, IUser } from "@/lib/models";
import connectToDatabase from "@/lib/mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "emberwatch_fallback_jwt_secret_dev_3829013824982390482093842";

// -------------------------------------------------------------
// 1. Password Hashing (PBKDF2)
// -------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// 2. JWT Implementation (HMAC-SHA256)
// -------------------------------------------------------------
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString();
}

export function signToken(payload: Record<string, any>, expiresInSeconds = 60 * 60 * 24 * 7): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 3. User Session Verification Helper for API Routes
// -------------------------------------------------------------
export async function getSessionUser(): Promise<IUser | any | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("emberwatch_token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  try {
    const uri = process.env.MONGODB_URI || "";
    if (!uri.includes("<db_password>")) {
      await connectToDatabase();
      const user = await User.findById(decoded.userId).select("-passwordHash");
      if (user) return user;
    }
  } catch (err) {
    console.warn("DB connection check in getSessionUser:", err);
  }

  // Fallback to verified JWT payload if token signature is valid
  return {
    _id: decoded.userId,
    name: decoded.name || "Authenticated User",
    email: decoded.email,
    role: decoded.role || "analyst",
    isActive: true,
  };
}

export function checkRBAC(user: IUser | null, allowedRoles: Array<"admin" | "analyst" | "viewer">): boolean {
  if (!user || !user.isActive) return false;
  return allowedRoles.includes(user.role);
}
