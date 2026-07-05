import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getLocaleFromPath } from "./lib/access";

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

  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const hasSessionCookie = !!req.cookies.get(cookieName)?.value;
  const locale = getLocaleFromPath(req.nextUrl.pathname);

  if (!hasSessionCookie) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
