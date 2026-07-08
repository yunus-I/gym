import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays } from "date-fns";
import { hasManagerAccess } from "@/lib/access";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasManagerAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = (await req.json()) as {
      fullName?: string;
      phoneNumber?: string;
      photoUrl?: string;
      age?: string;
      gender?: string;
      planId?: string;
    };
    const { fullName, phoneNumber, photoUrl, age, gender, planId } = data;
    const { gymId } = session.user;

    if (!fullName || !planId) {
      return NextResponse.json({ error: "Full name and plan are required" }, { status: 400 });
    }

    // 1. Generate numeric Member ID (unique per gym)
    const lastMember = await prisma.member.findFirst({
      where: { gymId },
      orderBy: { memberId: "desc" },
    });

    const nextMemberId = lastMember ? lastMember.memberId + 1 : 1001;

    // 2. Fetch Plan to calculate expiry date
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const registrationDate = new Date();
    const expiryDate = addDays(registrationDate, plan.duration);

    // 3. Create Member and record initial payment atomically so a failure
    //    on either write does not leave a member without a payment record.
    const member = await prisma.$transaction(async (tx) => {
      const createdMember = await tx.member.create({
        data: {
          memberId: nextMemberId,
          fullName,
          phoneNumber,
          photoUrl,
          age: age ? parseInt(age) : null,
          gender,
          gymId,
          currentPlanId: planId,
          expiryDate,
          registrationDate,
        },
      });

      await tx.payment.create({
        data: {
          amount: plan.price,
          paymentMethod: "Cash", // Default to Cash for now
          memberId: createdMember.id,
          planId: plan.id,
          startDate: registrationDate,
          expiryDate: expiryDate,
        },
      });

      return createdMember;
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register member" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gymId } = session.user;

  const members = await prisma.member.findMany({
    where: { gymId },
    include: { currentPlan: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(members);
}
