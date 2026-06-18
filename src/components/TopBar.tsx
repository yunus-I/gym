'use client';

import { usePathname } from "@/i18n/routing";
import { Bell, Search, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobileMenu } from "./MobileMenuContext";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  members: "Members",
  payments: "Payments",
  settings: "Settings",
  "check-in": "Check-In",
  plans: "Plans",
  login: "Login",
};

export default function TopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toggleOpen } = useMobileMenu();

  const pageKey = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const pageTitle = PAGE_TITLES[pageKey] ?? pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

  return (
    <header className="fixed top-0 left-0 right-0 h-[56px] bg-[#161B27] border-b border-[#2A3347] z-[100] flex items-center justify-between px-4">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={toggleOpen}
          className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors hover:bg-[#1E2535] rounded-lg flex items-center justify-center border-none cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#F1F5F9] truncate">{pageTitle}</p>
          <p className="text-[10px] text-[#64748B] truncate">GymOS</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="relative group hidden md:block w-48">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-9 pr-3 text-xs bg-[#1E2535] border border-[#2A3347] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
          />
        </div>

        <button className="relative p-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors hover:bg-[#1E2535] rounded-lg border-none cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F97316] rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-[#2A3347]">
          <Avatar className="w-8 h-8 ring-1 ring-[#2A3347] bg-[#1E2535]">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-[#1E2535] text-[#22C55E] text-xs font-bold">
              {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#F1F5F9] leading-none max-w-[100px] truncate">
              {session?.user?.name ?? "Admin User"}
            </p>
            <p className="text-[10px] text-[#94A3B8] leading-none mt-1">
              {session?.user?.role ?? "MANAGER"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
