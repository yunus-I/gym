import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireManager } from "@/lib/api";

export async function GET() {
  const session = await requireManager();
  if (session instanceof NextResponse) return session;

  const { gymId } = session.user;
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });

  return NextResponse.json(gym);
}

export async function PUT(req: Request) {
  const session = await requireManager();
  if (session instanceof NextResponse) return session;

  try {
    const { name, location, logoUrl } = (await req.json()) as {
      name?: string;
      location?: string | null;
      logoUrl?: string | null;
    };

    if (!name) {
      return jsonError("Name is required", 400);
    }

    const { gymId } = session.user;

    const gym = await prisma.gym.update({
      where: { id: gymId },
      data: { name, location, logoUrl },
    });

    return NextResponse.json(gym);
  } catch {
    return jsonError("Failed to update gym profile", 500);
  }
}
