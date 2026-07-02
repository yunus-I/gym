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
    <div className="flex items-center justify-center gap-0.5 bg-zinc-800/50 mx-4 rounded-lg border border-white/5">
      <button
        onClick={() => onLocaleChange('en')}
        disabled={isPending}
        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
          locale === 'en'
            ? 'bg-[#FF6B00] text-black shadow-sm'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLocaleChange('am')}
        disabled={isPending}
        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
          locale === 'am'
            ? 'bg-[#FF6B00] text-black shadow-sm'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        አማርኛ
      </button>
    </div>
  );
}
