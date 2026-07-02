'use client';

import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard,
  Settings,
  LogOut,
  X,
  ClipboardCheck,
  Shield
} from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Locale } from "@/types/app";
import type { LucideIcon } from "lucide-react";
import { hasManagerAccess, isSuperAdmin } from "@/lib/access";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobileMenu } from "./MobileMenuContext";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  managerOnly?: boolean;
  superAdminOnly?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const locale = useLocale() as Locale;
  const { data: session } = useSession();
  const { isOpen, setIsOpen } = useMobileMenu();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const canManage = hasManagerAccess(session?.user?.role);
  const superAdmin = isSuperAdmin(session?.user?.role);

  const menuItems: MenuItem[] = [
    { name: t("dashboard"), path: "/dashboard", icon: LayoutDashboard, managerOnly: true },
    { name: t("checkIn"), path: "/check-in", icon: ClipboardCheck },
    { name: t("members"), path: "/members", icon: Users },
    { name: t("payments"), path: "/payments", icon: CreditCard, managerOnly: true },
    { name: "Settings", path: "/settings/gym", icon: Settings, managerOnly: true },
    { name: "Admin", path: "/admin", icon: Shield, superAdminOnly: true },
  ];

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.superAdminOnly) return superAdmin;
    return !item.managerOnly || canManage;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-[120] w-[260px] bg-[#090909] border-r border-white/5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo / Header */}
          <div className="h-[56px] flex items-center justify-between px-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] flex items-center justify-center font-black text-xs text-black shadow-lg shadow-[#FF6B00]/25">
                G
              </div>
              <span className="text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">GymOS Pro</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg border-none cursor-pointer md:hidden transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="py-4 px-3 space-y-1.5">
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
                    w-full flex items-center gap-3 py-2.5 px-4 rounded-lg text-xs font-bold tracking-wider uppercase transition-all border-none cursor-pointer relative group
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/0 text-[#FF6B00]' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#FF6B00] rounded-r" />
                  )}
                  <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-[#FF6B00]' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-white/5 space-y-4 bg-[#090909]">
          <LanguageSwitcher />

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all text-left border-none cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 ring-1 ring-white/10 bg-[#151515]">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] text-black text-xs font-black">
                    {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate w-32">
                  <p className="text-xs font-bold text-white truncate leading-none">
                    {session?.user?.name ?? "John Admin"}
                  </p>
                  <p className={`text-[10px] leading-none mt-1 font-semibold ${superAdmin ? 'text-[#FF6B00]' : 'text-zinc-400'}`}>
                    {session?.user?.role ?? "ADMIN"}
                  </p>
                </div>
              </div>
              <span className="text-zinc-500 text-xs">▾</span>
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 py-2 divide-y divide-white/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={() => {
                    router.push("/settings/gym", { locale });
                    setShowProfileMenu(false);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors border-none cursor-pointer"
                >
                  Settings
                </button>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-none cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
