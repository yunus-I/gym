import { describe, it, expect, vi } from "vitest";
import type { Role } from "@prisma/client";

// access.ts only reads routing.locales / routing.defaultLocale. The real module
// pulls in next-intl's navigation helpers, which require Next's runtime module
// resolution and cannot load in a plain node test environment, so we stub it
// with the same locale configuration declared in src/i18n/routing.ts.
vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "am"], defaultLocale: "en" },
}));

import {
  hasManagerAccess,
  isSuperAdmin,
  stripLocalePrefix,
  getLocaleFromPath,
  isManagerOnlyPath,
} from "./access";

describe("hasManagerAccess", () => {
  it("grants access to MANAGER, ADMIN and SUPER_ADMIN", () => {
    (["MANAGER", "ADMIN", "SUPER_ADMIN"] as Role[]).forEach((role) => {
      expect(hasManagerAccess(role)).toBe(true);
    });
  });

  it("denies access to TICKER", () => {
    expect(hasManagerAccess("TICKER")).toBe(false);
  });

  it("denies access when the role is missing", () => {
    expect(hasManagerAccess(null)).toBe(false);
    expect(hasManagerAccess(undefined)).toBe(false);
  });
});

describe("isSuperAdmin", () => {
  it("returns true only for SUPER_ADMIN", () => {
    expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
  });

  it("returns false for other roles and missing roles", () => {
    (["MANAGER", "ADMIN", "TICKER"] as Role[]).forEach((role) => {
      expect(isSuperAdmin(role)).toBe(false);
    });
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});

describe("stripLocalePrefix", () => {
  it("returns '/' for the root path", () => {
    expect(stripLocalePrefix("/")).toBe("/");
  });

  it("returns '/' for a bare locale prefix", () => {
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/am")).toBe("/");
  });

  it("removes a leading locale segment", () => {
    expect(stripLocalePrefix("/en/dashboard")).toBe("/dashboard");
    expect(stripLocalePrefix("/am/members/register")).toBe("/members/register");
  });

  it("leaves paths without a locale prefix untouched", () => {
    expect(stripLocalePrefix("/dashboard")).toBe("/dashboard");
    expect(stripLocalePrefix("/members/register")).toBe("/members/register");
  });
});

describe("getLocaleFromPath", () => {
  it("extracts a supported locale from the first segment", () => {
    expect(getLocaleFromPath("/en/dashboard")).toBe("en");
    expect(getLocaleFromPath("/am")).toBe("am");
  });

  it("falls back to the default locale when none is present", () => {
    expect(getLocaleFromPath("/dashboard")).toBe("en");
    expect(getLocaleFromPath("/")).toBe("en");
  });
});

describe("isManagerOnlyPath", () => {
  it("matches manager-only paths regardless of locale prefix", () => {
    expect(isManagerOnlyPath("/dashboard")).toBe(true);
    expect(isManagerOnlyPath("/en/dashboard")).toBe(true);
    expect(isManagerOnlyPath("/am/plans")).toBe(true);
    expect(isManagerOnlyPath("/members/register")).toBe(true);
    expect(isManagerOnlyPath("/settings/gym")).toBe(true);
    expect(isManagerOnlyPath("/admin")).toBe(true);
  });

  it("matches nested paths under a manager-only prefix", () => {
    expect(isManagerOnlyPath("/admin/gyms/123")).toBe(true);
    expect(isManagerOnlyPath("/en/dashboard/overview")).toBe(true);
  });

  it("does not match non manager-only paths", () => {
    expect(isManagerOnlyPath("/members")).toBe(false);
    expect(isManagerOnlyPath("/login")).toBe(false);
    expect(isManagerOnlyPath("/en/check-in")).toBe(false);
    expect(isManagerOnlyPath("/")).toBe(false);
  });
});
