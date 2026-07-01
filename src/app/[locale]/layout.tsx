import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Providers } from "@/components/Providers";
import { getMessages } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { MobileMenuProvider } from "@/components/MobileMenuContext";
import type { Locale, IntlProviderMessages } from "@/types/app";

export const metadata: Metadata = {
  title: "Gym OS Management",
  description: "A professional gym management system for multiple locations.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-noto-ethiopic",
});

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = (await getMessages()) as IntlProviderMessages;
  const validatedLocale = locale as Locale;

  return (
    <html lang={validatedLocale} className={`h-full antialiased ${inter.variable} ${notoSansEthiopic.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans text-white">
        <Providers messages={messages} locale={validatedLocale}>
          <MobileMenuProvider>
            <div className="flex flex-col min-h-screen">
              {session && <TopBar />}
              <div className="flex flex-1">
                {session && <Sidebar />}
                <main className={`flex-1 transition-all duration-300 min-h-screen ${session ? 'pt-[56px] p-6 md:pl-[260px]' : ''}`}>
                  {children}
                </main>
              </div>
            </div>
          </MobileMenuProvider>
        </Providers>
      </body>
    </html>
  );
}
