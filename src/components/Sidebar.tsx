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
  ClipboardCheck
} from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Locale } from "@/types/app";
import type { LucideIcon } from "lucide-react";
import { hasManagerAccess } from "@/lib/access";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobileMenu } from "./MobileMenuContext";

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
  const { isOpen, setIsOpen } = useMobileMenu();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const canManage = hasManagerAccess(session?.user?.role);

  const menuItems: MenuItem[] = [
    { name: t("dashboard"), path: "/dashboard", icon: LayoutDashboard, managerOnly: true },
    { name: t("checkIn"), path: "/check-in", icon: ClipboardCheck },
    { name: t("members"), path: "/members", icon: Users },
    { name: t("payments"), path: "/payments", icon: CreditCard, managerOnly: true },
    { name: "Settings", path: "/settings/gym", icon: Settings, managerOnly: true },
  ];

  const visibleMenuItems = menuItems.filter((item) => !item.managerOnly || canManage);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
        onClick={() => setIsOpen(false)}
      />

      <aside className="fixed top-0 left-0 bottom-0 z-[120] w-[260px] bg-[#161B27] border-r border-[#2A3347] flex flex-col justify-between shadow-2xl">
        <div>
          <div className="h-[56px] flex items-center justify-between px-4 border-b border-[#2A3347]">
            <span className="text-sm font-bold text-[#F1F5F9]">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2535] rounded-lg border-none cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="py-3 px-3 space-y-1">
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
                    w-full flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-semibold tracking-tight transition-all border-none cursor-pointer
                    ${isActive 
                      ? 'bg-[rgba(34,197,94,0.12)] text-[#22C55E]' 
                      : 'text-[#94A3B8] hover:bg-[#1E2535] hover:text-[#F1F5F9]'}
                  `}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#2A3347] space-y-4 bg-[#161B27]">
          <div className="px-2">
            <LanguageSwitcher />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1E2535] transition-all text-left border-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 ring-1 ring-[#2A3347] bg-[#1E2535]">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback className="bg-[#1E2535] text-[#22C55E] text-xs font-bold">
                    {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate w-32">
                  <p className="text-xs font-bold text-[#F1F5F9] truncate leading-none">
                    {session?.user?.name ?? "John Admin"}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] leading-none mt-1">
                    {session?.user?.role ?? "ADMIN"}
                  </p>
                </div>
              </div>
              <span className="text-[#94A3B8] text-xs">▾</span>
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1E2535] border border-[#2A3347] rounded-xl shadow-xl z-50 py-2">
                <button
                  onClick={() => {
                    router.push("/settings/gym", { locale });
                    setShowProfileMenu(false);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-[#CBD5E1] hover:bg-[#2A3347] hover:text-[#F1F5F9] transition-colors border-none cursor-pointer"
                >
                  Settings
                </button>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2 border-none cursor-pointer"
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
