'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Common");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6" />
          <span className="font-bold tracking-tight opacity-0">Theme</span>
        </div>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all group"
    >
      <div className="flex items-center gap-4">
        {isDark ? (
          <Moon className="w-6 h-6 group-hover:text-indigo-600 transition-colors" />
        ) : (
          <Sun className="w-6 h-6 group-hover:text-amber-500 transition-colors" />
        )}
        <span className="font-bold tracking-tight">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </div>
    </button>
  );
}
