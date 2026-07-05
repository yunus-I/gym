import createIntlMiddleware from "next-intl/middleware";
import { getToken, decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getLocaleFromPath, hasManagerAccess, isManagerOnlyPath } from "./lib/access";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest): Promise<NextResponse | Response> {
  const publicPages = ["/", "/login", "/api/auth/.*"];
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${publicPages
      .flatMap((page) => (page === "/" ? ["", "/"] : [page]))
      .join("|")})/?$`,
    "i"
  );

  if (publicPathnameRegex.test(req.nextUrl.pathname)) {
    return intlMiddleware(req);
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const rawToken = req.cookies.get(cookieName)?.value;
  const token = rawToken
    ? await decode({ token: rawToken, secret }).catch(() => null)
    : null;

  const locale = getLocaleFromPath(req.nextUrl.pathname);

  if (!token) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isManagerOnlyPath(req.nextUrl.pathname) && !hasManagerAccess(token.role)) {
    return NextResponse.redirect(new URL(`/${locale}/check-in`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
