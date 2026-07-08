import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireSuperAdmin } from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  try {
    const { email, password, name, role } = (await req.json()) as {
      email: string;
      password: string;
      name?: string;
      role?: string;
    };

    if (!email || !password) {
      return jsonError("Email and password are required", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || "Staff",
        role: (role as any) || "TICKER",
        gymId: id,
      },
    });

    return NextResponse.json(user);
  } catch {
    return jsonError("Failed to create user", 500);
  }
}
