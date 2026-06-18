import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();
    const { gymId } = session.user;

    if (!query) return NextResponse.json([]);

    const orConditions: { fullName?: { contains: string }; memberId?: number }[] = [
      { fullName: { contains: query } },
    ];

    if (!isNaN(parseInt(query))) {
      orConditions.push({ memberId: parseInt(query) });
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const members = await prisma.member.findMany({
      where: {
        gymId,
        OR: orConditions,
      },
      select: {
        id: true,
        memberId: true,
        fullName: true,
        phoneNumber: true,
        photoUrl: true,
        age: true,
        gender: true,
        status: true,
        expiryDate: true,
        registrationDate: true,
        currentPlan: {
          select: { name: true, duration: true, price: true },
        },
        attendances: {
          orderBy: { checkIn: "desc" },
          take: 1,
          select: { id: true, checkIn: true },
        },
      },
      take: 8,
    });

    const memberIds = members.map((m) => m.id);
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        memberId: { in: memberIds },
        checkIn: { gte: todayStart, lte: todayEnd },
      },
      select: { memberId: true, checkIn: true },
    });

    const checkedInTodayMap = new Map(
      todayAttendances.map((a) => [a.memberId, a.checkIn])
    );

    const results = members.map((member) => ({
      ...member,
      checkedInToday: checkedInTodayMap.has(member.id),
      todayCheckInTime: checkedInTodayMap.get(member.id) ?? null,
    }));

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("GET /api/check-in error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Internal Server Error", message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { memberId } = (await req.json()) as { memberId?: string };

    if (!memberId) {
      return NextResponse.json({ error: "Member is required" }, { status: 400 });
    }

    const { gymId } = session.user;

    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId },
      select: { id: true, expiryDate: true, fullName: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const today = new Date();
    if (!member.expiryDate || member.expiryDate < startOfDay(today)) {
      return NextResponse.json({ error: "Subscription expired" }, { status: 400 });
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        memberId,
        checkIn: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
      data: { memberId },
    });

    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 });
  }
}
