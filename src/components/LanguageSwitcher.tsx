'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onLocaleChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
      <button
        onClick={() => onLocaleChange('en')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
          locale === 'en'
            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLocaleChange('am')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
          locale === 'am'
            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
        }`}
      >
        አማርኛ
      </button>
    </div>
  );
}
