import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireAuth, requireManager } from "@/lib/api";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { gymId } = session.user;

  const plans = await prisma.plan.findMany({
    where: { gymId },
    orderBy: { duration: "asc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await requireManager();
  if (session instanceof NextResponse) return session;

  try {
    const { name, duration, price } = (await req.json()) as {
      name?: string;
      duration?: string | number;
      price?: string | number;
    };

    if (!name || duration === undefined || price === undefined) {
      return jsonError("Missing plan details", 400);
    }

    const { gymId } = session.user;

    const plan = await prisma.plan.create({
      data: {
        name,
        duration: Number(duration),
        price: Number(price),
        gymId,
      },
    });

    return NextResponse.json(plan);
  } catch {
    return jsonError("Failed to create plan", 500);
  }
}

export async function PUT(req: Request) {
  const session = await requireManager();
  if (session instanceof NextResponse) return session;

  try {
    const { id, name, duration, price, isActive } = (await req.json()) as {
      id?: string;
      name?: string;
      duration?: string | number;
      price?: string | number;
      isActive?: boolean;
    };

    if (!id || !name || duration === undefined || price === undefined || isActive === undefined) {
      return jsonError("Missing plan details", 400);
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name,
        duration: Number(duration),
        price: Number(price),
        isActive,
      },
    });

    return NextResponse.json(plan);
  } catch {
    return jsonError("Failed to update plan", 500);
  }
}
