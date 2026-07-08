import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays, isAfter } from "date-fns";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { memberId, planId, amount, paymentMethod, notes } = (await req.json()) as {
      memberId?: string;
      planId?: string;
      amount?: number | string;
      paymentMethod?: string;
      notes?: string | null;
    };

    if (!memberId || !planId || amount === undefined || !paymentMethod) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const { gymId } = session.user;

    const plan = await prisma.plan.findFirst({ where: { id: planId, gymId } });
    const member = await prisma.member.findFirst({ where: { id: memberId, gymId } });

    if (!plan || !member) {
      return NextResponse.json({ error: "Invalid plan or member" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
