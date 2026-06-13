'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { hasManagerAccess } from '@/lib/access';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const common = useTranslations('Common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        const session = await getSession();
        router.push(hasManagerAccess(session?.user?.role) ? '/dashboard' : '/check-in');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 rotate-3">
                <span className="text-white font-bold text-3xl">G</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {t('signIn')}
              </h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                  placeholder="manager@gym.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    {t('password')}
                  </label>
                  <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t('forgotPassword')}
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/30 transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {common('loading')}
                  </>
                ) : (
                  t('signIn')
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 text-center border-t border-slate-100 dark:border-zinc-800">
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Need assistance? <a href="#" className="text-indigo-600 dark:text-indigo-400 font-bold">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
