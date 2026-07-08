import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasManagerAccess, isSuperAdmin } from "@/lib/access";

export function jsonError(
  error: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json({ error, ...extra }, { status });
}

/**
 * Returns the authenticated session, or a 401 response when there is none.
 * Callers should early-return when the result is a `NextResponse`:
 *
 *   const session = await requireAuth();
 *   if (session instanceof NextResponse) return session;
 */
export async function requireAuth(): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return jsonError("Unauthorized", 401);
  return session;
}

/** Requires an authenticated user with manager (or higher) access. */
export async function requireManager(): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return jsonError("Unauthorized", 401);
  if (!hasManagerAccess(session.user.role)) return jsonError("Forbidden", 403);
  return session;
}

/** Requires an authenticated super admin. */
export async function requireSuperAdmin(): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role)) return jsonError("Forbidden", 403);
  return session;
}
