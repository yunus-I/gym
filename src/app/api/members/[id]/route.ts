import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireAuth } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

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
    return jsonError("Member not found", 404);
  }

  return NextResponse.json(member);
}
