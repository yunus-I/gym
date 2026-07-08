import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, isAfter } from "date-fns";
import { jsonError, requireAuth } from "@/lib/api";

export async function POST(req: Request) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  try {
    const { memberId, planId, amount, paymentMethod, notes } = (await req.json()) as {
      memberId?: string;
      planId?: string;
      amount?: number | string;
      paymentMethod?: string;
      notes?: string | null;
    };

    if (!memberId || !planId || amount === undefined || !paymentMethod) {
      return jsonError("Missing payment details", 400);
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    const member = await prisma.member.findUnique({ where: { id: memberId } });

    if (!plan || !member) {
      return jsonError("Invalid plan or member", 400);
    }

    // Calculate new expiry date
    // If current subscription is still active, add to the existing expiry date.
    // Otherwise, start from today.
    const now = new Date();
    const baseDate = member.expiryDate && isAfter(member.expiryDate, now) 
      ? new Date(member.expiryDate) 
      : now;
    
    const newExpiryDate = addDays(baseDate, plan.duration);

    // Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        paymentMethod,
        notes,
        memberId,
        planId,
        startDate: baseDate,
        expiryDate: newExpiryDate,
      },
    });

    // Update Member
    await prisma.member.update({
      where: { id: memberId },
      data: {
        currentPlanId: planId,
        expiryDate: newExpiryDate,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    return jsonError("Failed to record payment", 500);
  }
}

export async function GET(req: Request) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const { gymId } = session.user;

  const payments = await prisma.payment.findMany({
    where: {
      memberId: memberId || undefined,
      member: { gymId },
    },
    include: {
      plan: true,
      member: true,
    },
    orderBy: { paymentDate: "desc" },
  });

  return NextResponse.json(payments);
}
