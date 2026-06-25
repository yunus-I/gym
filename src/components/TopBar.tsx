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
    <header className="fixed top-0 left-0 md:left-[260px] right-0 h-[56px] bg-[#0B0B0B]/80 backdrop-blur-md border-b border-white/5 z-[100] flex items-center justify-between px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={toggleOpen}
          className="p-2 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg flex items-center justify-center border-none cursor-pointer shrink-0 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">{pageTitle}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-0.5">GymOS Pro</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="relative group hidden md:block w-48">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full h-8 pl-9 pr-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>

        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg border-none cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-white/5">
          <Avatar className="w-8 h-8 ring-1 ring-white/10 bg-[#151515]">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-[#151515] text-[#FF6B00] text-xs font-black">
              {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-none max-w-[100px] truncate">
              {session?.user?.name ?? "Admin User"}
            </p>
            <p className="text-[10px] text-zinc-400 font-semibold leading-none mt-1 uppercase tracking-wider">
              {session?.user?.role ?? "MANAGER"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
