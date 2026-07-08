import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasManagerAccess } from "@/lib/access";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { gymId } = session.user;

  const plans = await prisma.plan.findMany({
    where: { gymId },
    orderBy: { duration: "asc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasManagerAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, duration, price } = (await req.json()) as {
      name?: string;
      duration?: string | number;
      price?: string | number;
    };

    if (!name || duration === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing plan details" }, { status: 400 });
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
  } catch (error) {
    console.error("POST /api/plans error:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
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
    const { id, name, duration, price, isActive } = (await req.json()) as {
      id?: string;
      name?: string;
      duration?: string | number;
      price?: string | number;
      isActive?: boolean;
    };

    if (!id || !name || duration === undefined || price === undefined || isActive === undefined) {
      return NextResponse.json({ error: "Missing plan details" }, { status: 400 });
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
  } catch (error) {
    console.error("PUT /api/plans error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
