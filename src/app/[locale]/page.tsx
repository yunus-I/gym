import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("Index");
  const nav = useTranslations("Navigation");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-500">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-white/20 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            GYM PRO
          </span>
        </div>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Link href="/login">
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25">
              {nav("login")}
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="max-w-4xl w-full text-center space-y-8 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            {t("welcome")} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              {t("title")}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/dashboard" className="group">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-2xl font-bold text-lg transition-all">
                Watch Demo
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-24 w-full max-w-5xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-[2.2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
            <div className="h-12 bg-slate-50 dark:bg-zinc-800/50 flex items-center px-6 gap-2 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="mx-auto text-xs font-medium text-slate-400 dark:text-zinc-500 bg-slate-200/50 dark:bg-zinc-700/50 px-4 py-1 rounded-md">
                gym-management-system.io
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center">
               <span className="text-slate-400 dark:text-zinc-600 font-mono italic">Dashboard Preview Coming Soon</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 px-8 border-t border-slate-200 dark:border-zinc-900 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-500 dark:text-zinc-500 text-sm">
            © 2026 GYM PRO Management System. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-600 dark:text-zinc-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
