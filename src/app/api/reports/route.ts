import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, startOfDay, endOfDay } from "date-fns";
import { hasManagerAccess } from "@/lib/access";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasManagerAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");
  const { gymId } = session.user;

  const startDate = startDateStr ? new Date(startDateStr) : startOfMonth(new Date());
  const endDate = endDateStr ? new Date(endDateStr) : endOfMonth(new Date());

  // 1. Fetch Attendance Data
  const attendances = await prisma.attendance.findMany({
    where: {
      member: { gymId },
      checkIn: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
    },
    select: { checkIn: true },
  });

  // 2. Fetch Financial Data
  const payments = await prisma.payment.findMany({
    where: {
      member: { gymId },
      paymentDate: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
    },
    select: { amount: true, paymentDate: true, plan: { select: { name: true } } },
  });

  // 3. Process data for charts
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayAttendance = attendances.filter(a => format(a.checkIn, 'yyyy-MM-dd') === dateStr).length;
    const dayRevenue = payments
      .filter(p => format(p.paymentDate, 'yyyy-MM-dd') === dateStr)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      date: format(day, 'MMM dd'),
      attendance: dayAttendance,
      revenue: dayRevenue,
    };
  });

  // 4. Breakdown by plan
  const planBreakdown: Record<string, number> = {};
  payments.forEach(p => {
    const name = p.plan.name;
    planBreakdown[name] = (planBreakdown[name] || 0) + p.amount;
  });

  return NextResponse.json({
    dailyData,
    planBreakdown: Object.entries(planBreakdown).map(([name, value]) => ({ name, value })),
    totalRevenue: payments.reduce((acc, curr) => acc + curr.amount, 0),
    totalAttendance: attendances.length,
  });
}
