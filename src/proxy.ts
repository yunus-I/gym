import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
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

  const token = await getToken({ req });
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
