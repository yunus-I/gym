import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { gymId } = session.user;

  const member = await prisma.member.findUnique({
    where: { id, gymId },
    include: {
      attendances: {
        orderBy: { checkIn: "desc" },
      },
      payments: {
        include: { plan: true },
        orderBy: { paymentDate: "desc" },
      },
      currentPlan: true,
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}
