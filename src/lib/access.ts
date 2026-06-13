import type { Role } from "@prisma/client";
import { routing } from "@/i18n/routing";

const MANAGER_ROLES: Role[] = ["MANAGER", "ADMIN"];

export function hasManagerAccess(role?: Role | null): boolean {
  return Boolean(role && MANAGER_ROLES.includes(role));
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  if (routing.locales.includes(segments[0] as (typeof routing.locales)[number])) {
    const localizedPath = `/${segments.slice(1).join("/")}`;
    return localizedPath === "/" ? "/" : localizedPath;
  }

  return pathname;
}

export function getLocaleFromPath(pathname: string): string {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment && routing.locales.includes(firstSegment as (typeof routing.locales)[number])) {
    return firstSegment;
  }

  return routing.defaultLocale;
}

export function isManagerOnlyPath(pathname: string): boolean {
  const normalizedPath = stripLocalePrefix(pathname);

  return [
    "/dashboard",
    "/members/register",
    "/plans",
    "/reports",
    "/settings/gym",
  ].some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`));
}
