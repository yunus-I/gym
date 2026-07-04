import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasManagerAccess } from "@/lib/access";
import HomeLanding from "@/components/HomeLanding";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (session) {
    if (hasManagerAccess(session.user?.role)) {
      redirect(`/${locale}/dashboard`);
    }
    redirect(`/${locale}/check-in`);
  }

  return <HomeLanding />;
}
