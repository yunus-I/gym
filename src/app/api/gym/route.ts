import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasManagerAccess } from "@/lib/access";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasManagerAccess(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { gymId } = session.user;
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });

  return NextResponse.json(gym);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasManagerAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, location, logoUrl } = (await req.json()) as {
      name?: string;
      location?: string | null;
      logoUrl?: string | null;
    };

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { gymId } = session.user;

    const gym = await prisma.gym.update({
      where: { id: gymId },
      data: { name, location, logoUrl },
    });

    return NextResponse.json(gym);
  } catch {
    return NextResponse.json({ error: "Failed to update gym profile" }, { status: 500 });
  }
}
