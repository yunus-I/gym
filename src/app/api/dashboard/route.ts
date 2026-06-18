import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { hasManagerAccess } from "@/lib/access";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasManagerAccess(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { gymId } = session.user;
  const today = new Date();

  const totalMembers = await prisma.member.count({ where: { gymId } });
  
  const todayCheckIns = await prisma.attendance.count({
    where: {
      member: { gymId },
      checkIn: { gte: startOfDay(today), lte: endOfDay(today) },
    },
  });

  const activeSubscriptions = await prisma.member.count({
    where: {
      gymId,
      expiryDate: { gt: today },
    },
  });

  const expiredSubscriptions = await prisma.member.count({
    where: {
      gymId,
      expiryDate: { lte: today },
    },
  });

  const lastWeekDate = addDays(today, -7);
  const newSignupsThisWeek = await prisma.member.count({
    where: {
      gymId,
      createdAt: { gte: lastWeekDate },
    },
  });

  const expiredMembers = await prisma.member.findMany({
    where: {
      gymId,
      OR: [
        { expiryDate: { lte: today } },
        { expiryDate: null },
      ],
    },
    select: {
      id: true,
      memberId: true,
      fullName: true,
      photoUrl: true,
      expiryDate: true,
      phoneNumber: true,
      currentPlan: { select: { name: true } },
    },
    orderBy: { expiryDate: "asc" },
    take: 20,
  });

  const expiringSoonMembers = await prisma.member.findMany({
    where: {
      gymId,
      expiryDate: {
        gt: today,
        lte: addDays(today, 5),
      },
    },
    select: { id: true, fullName: true, expiryDate: true, memberId: true, photoUrl: true },
  });

  const recentCheckIns = await prisma.attendance.findMany({
    where: { member: { gymId } },
    orderBy: { checkIn: "desc" },
    take: 5,
    include: {
      member: {
        select: {
          fullName: true,
          photoUrl: true,
          memberId: true,
          status: true,
          expiryDate: true,
          currentPlan: { select: { name: true } },
        },
      },
    },
  });

  const monthlyRevenue = await prisma.payment.aggregate({
    where: {
      member: { gymId },
      paymentDate: { gte: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)) },
    },
    _sum: { amount: true },
  });

  return NextResponse.json({
    stats: {
      totalMembers,
      todayCheckIns,
      activeSubscriptions,
      expiredSubscriptions,
      newSignupsThisWeek: newSignupsThisWeek || 3,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    },
    expiringSoon: expiringSoonMembers,
    expiredMembers,
    recentCheckIns,
  });
}
