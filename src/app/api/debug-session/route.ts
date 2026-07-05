import { decode, getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const rawCookie = req.cookies.get(cookieName)?.value || "none";
  const fromHeaders = req.headers.get("cookie") || "none";

  let decoded = null;
  let decodeError = null;

  if (rawCookie !== "none") {
    try {
      decoded = await decode({ token: rawCookie, secret });
    } catch (e: any) {
      decodeError = e.message;
    }
  }

  let fromGetToken = null;
  let getTokenError = null;
  try {
    fromGetToken = await getToken({ req, secret, cookieName });
  } catch (e: any) {
    getTokenError = e.message;
  }

  return NextResponse.json({
    cookieName,
    hasCookie: rawCookie !== "none",
    cookieLength: rawCookie !== "none" ? rawCookie.length : 0,
    hasSecret: !!secret,
    secretLength: secret?.length || 0,
    decodeResult: decoded,
    decodeError,
    getTokenResult: fromGetToken,
    getTokenError,
    hasCookieHeader: fromHeaders !== "none",
    cookieHeaderPreview: fromHeaders.substring(0, 100),
  });
}
