import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const uri = process.env.MONGODB_URI || "";

  if (!uri) {
    return NextResponse.json(
      {
        status: "error",
        message: "MONGODB_URI is not defined in .env.local",
      },
      { status: 500 }
    );
  }

  if (uri.includes("<db_password>")) {
    return NextResponse.json(
      {
        status: "pending_credentials",
        message:
          "Please replace '<db_password>' with your actual database user password in .env.local",
      },
      { status: 200 }
    );
  }

  try {
    const client = await clientPromise;
    // Ping the admin database to verify connection
    const adminDb = client.db().admin();
    const pingResult = await adminDb.ping();

    // List available databases
    const dbs = await adminDb.listDatabases();

    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to MongoDB Atlas!",
      ping: pingResult,
      databases: dbs.databases.map((db) => db.name),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    let hint = "Check your connection string, credentials, and network.";

    if (errorMessage.includes("bad auth") || errorMessage.includes("Authentication failed")) {
      hint = "Authentication failed. Please verify your MongoDB username and password in .env.local.";
    } else if (errorMessage.includes("querySrv") || errorMessage.includes("ENOTFOUND")) {
      hint = "DNS/Network issue resolving cluster host. Make sure your internet connection is active.";
    } else if (errorMessage.includes("whitelist") || errorMessage.includes("connection closed")) {
      hint = "IP Address Access: Make sure your current IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address / Allow access from anywhere 0.0.0.0/0).";
    }

    return NextResponse.json(
      {
        status: "connection_failed",
        error: errorMessage,
        hint,
      },
      { status: 500 }
    );
  }
}
