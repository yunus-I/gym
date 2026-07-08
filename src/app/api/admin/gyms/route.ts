import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/access";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, users: true, plans: true } },
    },
  });

  return NextResponse.json(gyms);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { name, location, managerEmail, managerPassword, managerName } = (await req.json()) as {
      name: string;
      location?: string;
      managerEmail: string;
      managerPassword: string;
      managerName?: string;
    };

    if (!name || !managerEmail || !managerPassword) {
      return NextResponse.json({ error: "Gym name, manager email, and password are required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(managerPassword, 10);

    const defaultPlans = [
      { name: "Monthly", duration: 30, price: 1000 },
      { name: "Quarterly", duration: 90, price: 2700 },
      { name: "Yearly", duration: 365, price: 10000 },
    ];

    const gym = await prisma.$transaction(async (tx) => {
      const createdGym = await tx.gym.create({
        data: { name, location },
      });

      await tx.user.create({
        data: {
          email: managerEmail,
          password: hashedPassword,
          name: managerName || "Gym Manager",
          role: "MANAGER",
          gymId: createdGym.id,
        },
      });

      await tx.plan.createMany({
        data: defaultPlans.map((plan) => ({ ...plan, gymId: createdGym.id })),
      });

      return createdGym;
    });

    return NextResponse.json(gym);
  } catch (error) {
    console.error("POST /api/admin/gyms error:", error);
    return NextResponse.json({ error: "Failed to create gym" }, { status: 500 });
  }
}
