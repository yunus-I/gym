import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { Role, type User } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const findUnique = vi.mocked(prisma.user.findUnique);
const compare = vi.mocked(bcrypt.compare);

// next-auth normalizes the top-level provider.authorize into an internal wrapper;
// the raw authorize callback defined in auth.ts is preserved under options.authorize.
const credentialsProvider = authOptions.providers[0] as CredentialsConfig;
const authorize = credentialsProvider.options.authorize;
// The runtime req argument is unused by authorize; a bare cast keeps the tests focused.
const req = {} as Parameters<typeof authorize>[1];

const dbUser: User = {
  id: "user-1",
  email: "a@b.com",
  name: "Alice",
  password: "hashed",
  role: Role.MANAGER,
  gymId: "gym-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("credentials authorize", () => {
  it("returns null when email or password is missing", async () => {
    expect(await authorize({ email: "", password: "x" }, req)).toBeNull();
    expect(await authorize({ email: "a@b.com", password: "" }, req)).toBeNull();
    expect(await authorize(undefined, req)).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the user does not exist", async () => {
    findUnique.mockResolvedValue(null);
    expect(
      await authorize({ email: "a@b.com", password: "secret" }, req)
    ).toBeNull();
  });

  it("returns null when the user has no password set", async () => {
    findUnique.mockResolvedValue({ ...dbUser, password: "" });
    expect(
      await authorize({ email: "a@b.com", password: "secret" }, req)
    ).toBeNull();
  });

  it("returns null when the password does not match", async () => {
    findUnique.mockResolvedValue(dbUser);
    compare.mockResolvedValue(false as never);
    expect(
      await authorize({ email: "a@b.com", password: "wrong" }, req)
    ).toBeNull();
    expect(compare).toHaveBeenCalledWith("wrong", "hashed");
  });

  it("returns the sanitized user when credentials are valid", async () => {
    findUnique.mockResolvedValue(dbUser);
    compare.mockResolvedValue(true as never);
    const result = await authorize(
      { email: "a@b.com", password: "secret" },
      req
    );
    expect(result).toEqual({
      id: "user-1",
      email: "a@b.com",
      name: "Alice",
      role: Role.MANAGER,
      gymId: "gym-1",
    });
  });
});

describe("jwt callback", () => {
  const jwt = authOptions.callbacks!.jwt!;

  it("copies role and gymId from the user onto the token", async () => {
    const token = await jwt({
      token: {},
      user: { id: "user-1", role: Role.ADMIN, gymId: "gym-9" },
    } as Parameters<typeof jwt>[0]);
    expect(token).toMatchObject({ role: Role.ADMIN, gymId: "gym-9" });
  });

  it("leaves the token untouched when no user is present", async () => {
    const token = await jwt({
      token: { sub: "abc" },
    } as Parameters<typeof jwt>[0]);
    expect(token).toEqual({ sub: "abc" });
  });
});

describe("session callback", () => {
  const session = authOptions.callbacks!.session!;

  it("populates session.user from the token", async () => {
    const result = await session({
      session: { user: { name: "Alice" }, expires: "" },
      token: { sub: "user-1", role: Role.MANAGER, gymId: "gym-1" },
    } as Parameters<typeof session>[0]);
    expect(result.user).toMatchObject({
      id: "user-1",
      role: Role.MANAGER,
      gymId: "gym-1",
    });
  });

  it("falls back to defaults when the token lacks fields", async () => {
    const result = await session({
      session: { user: { name: "Bob", id: "existing" }, expires: "" },
      token: {},
    } as Parameters<typeof session>[0]);
    expect(result.user).toMatchObject({
      id: "existing",
      role: Role.TICKER,
      gymId: "",
    });
  });
});
