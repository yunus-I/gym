'use client';

import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import type { Locale } from "@/types/app";
import type { LucideIcon } from "lucide-react";
import { hasManagerAccess } from "@/lib/access";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  managerOnly?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const locale = useLocale() as Locale;
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const canManage = hasManagerAccess(session?.user?.role);

  const menuItems: MenuItem[] = [
    { name: t("dashboard"), path: "/dashboard", icon: LayoutDashboard, managerOnly: true },
    { name: t("members"), path: "/members", icon: Users },
    { name: t("checkIn"), path: "/check-in", icon: CheckSquare },
    { name: t("plans"), path: "/plans", icon: CreditCard, managerOnly: true },
    { name: t("reports"), path: "/reports", icon: BarChart3, managerOnly: true },
    { name: "Gym Profile", path: "/settings/gym", icon: Settings, managerOnly: true },
  ];
  const visibleMenuItems = menuItems.filter((item) => !item.managerOnly || canManage);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-[100] p-3 bg-indigo-600 text-white rounded-2xl shadow-xl"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-[90] w-80 bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800
        transition-transform duration-500 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 rotate-3">
              <span className="text-white font-black text-2xl">G</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">GYM PRO</span>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">Management System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {visibleMenuItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path, { locale });
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl transition-all group
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-2' 
                      : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'group-hover:text-indigo-600'} transition-colors`} />
                    <span className="font-bold tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto space-y-6 pt-8 border-t border-slate-100 dark:border-zinc-800">
            <div className="px-2 space-y-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
            >
              <LogOut className="w-6 h-6" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
