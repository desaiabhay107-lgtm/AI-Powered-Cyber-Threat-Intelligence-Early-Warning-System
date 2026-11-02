import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { User, AuditLog } from "@/lib/models";
import { verifyPassword, hashPassword, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory rate limiting tracker for IP addresses
const ipAttempts = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 15) {
    return false; // Exceeded 15 attempts per 15 minutes from same IP
  }
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkIpRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts from this network. Please wait 15 minutes.",
        },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const uri = process.env.MONGODB_URI || "";
    const isAtlasConfigured = uri && !uri.includes("<db_password>");

    if (isAtlasConfigured) {
      await connectToDatabase();

      // Check if user table is completely empty, initialize primary admin if so
      const totalUsers = await User.countDocuments();
      if (totalUsers === 0) {
        const defaultAdminPass = process.env.ADMIN_PASSWORD || "EmberWatch2026!";
        const defaultAdminEmail = process.env.ADMIN_EMAIL || "admin@emberwatch.dev";
        await User.create({
          name: "Abhay Desai (Admin)",
          email: defaultAdminEmail.toLowerCase().trim(),
          passwordHash: hashPassword(defaultAdminPass),
          role: "admin",
          preferences: { theme: "cream", notifications: { inApp: true, email: true } },
          isActive: true,
        });
      }

      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: "Account has been deactivated. Contact an administrator." },
          { status: 403 }
        );
      }

      // Check lockout status
      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.lockoutUntil.getTime() - Date.now()) / (60 * 1000)
        );
        return NextResponse.json(
          {
            success: false,
            error: `Account is temporarily locked due to consecutive failed attempts. Try again in ${remainingMinutes} minute(s).`,
          },
          { status: 423 }
        );
      }

      const isValid = verifyPassword(password, user.passwordHash);

      if (!isValid) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        user.failedLoginAttempts = attempts;
        if (attempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lockout
          await user.save();
          return NextResponse.json(
            {
              success: false,
              error: "Account locked for 15 minutes due to 5 consecutive failed attempts.",
            },
            { status: 423 }
          );
        }
        await user.save();
        return NextResponse.json(
          {
            success: false,
            error: `Invalid credentials. (${5 - attempts} attempt(s) remaining before lockout)`,
          },
          { status: 401 }
        );
      }

      // Successful login
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
      user.lastLoginAt = new Date();
      await user.save();

      // Write audit log
      try {
        await AuditLog.create({
          userId: user._id.toString(),
          userName: user.email,
          action: "USER_LOGIN_SUCCESS",
          entity: "User",
          entityId: user._id.toString(),
          ip: clientIp,
          at: new Date(),
        });
      } catch { /* Non-critical — continue even if audit log fails */ }

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const response = NextResponse.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferences: user.preferences,
          },
        },
      });

      response.cookies.set("emberwatch_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    } else {
      // Local development fallback when MongoDB URI is awaiting password
      const defaultAdminPass = process.env.ADMIN_PASSWORD || "EmberWatch2026!";
      const defaultAdminEmail = (process.env.ADMIN_EMAIL || "admin@emberwatch.dev").toLowerCase().trim();

      if (cleanEmail === defaultAdminEmail && password === defaultAdminPass) {
        const token = signToken({
          userId: "local-admin-1",
          email: defaultAdminEmail,
          role: "admin",
          name: "Abhay Desai (Admin)",
        });

        const response = NextResponse.json({
          success: true,
          data: {
            user: {
              id: "local-admin-1",
              name: "Abhay Desai (Admin)",
              email: defaultAdminEmail,
              role: "admin",
              preferences: { theme: "cream", notifications: { inApp: true, email: true } },
            },
          },
        });

        response.cookies.set("emberwatch_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }

      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Authentication error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
