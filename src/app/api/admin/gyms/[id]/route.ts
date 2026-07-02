import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const gym = await prisma.gym.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "desc" } },
      _count: { select: { members: true, plans: true } },
    },
  });

  if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });
  return NextResponse.json(gym);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await prisma.payment.deleteMany({ where: { member: { gymId: id } } });
  await prisma.attendance.deleteMany({ where: { member: { gymId: id } } });
  await prisma.member.deleteMany({ where: { gymId: id } });
  await prisma.plan.deleteMany({ where: { gymId: id } });
  await prisma.user.deleteMany({ where: { gymId: id } });
  await prisma.gym.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
