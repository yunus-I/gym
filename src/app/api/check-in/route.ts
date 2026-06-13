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
    const query = searchParams.get("query");
    const { gymId } = session.user;

    if (!query) return NextResponse.json([]);

    const orConditions: any[] = [
      { fullName: { contains: query } },
    ];

    if (!isNaN(parseInt(query))) {
      orConditions.push({ memberId: parseInt(query) });
    }

    // Search by name or memberId
    const members = await prisma.member.findMany({
      where: {
        gymId,
        OR: orConditions,
      },
      include: {
        attendances: {
          orderBy: { checkIn: "desc" },
          take: 1,
        },
      },
      take: 5,
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error("GET /api/check-in error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
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

    // 1. Check if member already checked in today
    const today = new Date();
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

    // 2. Record Attendance
    const attendance = await prisma.attendance.create({
      data: {
        memberId,
      },
    });

    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 });
  }
}
