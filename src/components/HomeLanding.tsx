'use client';

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function HomeLanding() {
  const t = useTranslations("Index");
  const nav = useTranslations("Navigation");

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1117] text-[#F1F5F9]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2A3347]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
            <span className="text-[#0F1117] font-bold text-sm">G</span>
          </div>
          <span className="text-sm font-bold text-[#F1F5F9]">GymOS</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-lg font-semibold text-[#F1F5F9]">
              {t("title")}
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full px-5 py-2.5 bg-[#22C55E] hover:bg-[#1ea850] text-[#0F1117] rounded-lg font-semibold text-sm transition-colors border-none cursor-pointer">
                {nav("login")}
              </button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 px-6 border-t border-[#2A3347] text-center">
        <p className="text-xs text-[#64748B]">
          © 2026 GymOS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
