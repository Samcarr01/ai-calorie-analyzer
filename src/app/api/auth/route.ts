import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ACCESS_CODE = process.env.ACCESS_CODE || "imfat";
const COOKIE_NAME = "calorieai_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// POST /api/auth - Validate access code and set session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Code required" },
        { status: 400 }
      );
    }

    // Validate access code (case-insensitive)
    if (code.trim().toLowerCase() !== ACCESS_CODE.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Invalid code" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateSessionToken();

    // Set secure HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// GET /api/auth - Check if user has valid session
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false });
}

// DELETE /api/auth - Logout (clear session)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
