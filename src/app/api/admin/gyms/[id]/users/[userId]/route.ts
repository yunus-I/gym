import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/access";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !isSuperAdmin(session.user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
