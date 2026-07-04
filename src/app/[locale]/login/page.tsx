'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('LOGIN PAGE MOUNTED');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('FORM SUBMITTED');
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/en',
      });

      console.log('SIGNIN RESULT', result);
    } catch (err) {
      console.error('LOGIN ERROR', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#151515] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#FF8C39] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 mb-6 rotate-3">
                <span className="text-black font-bold text-3xl">G</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">
                Sign In
              </h1>
              <p className="text-zinc-400 text-sm">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-900/20 border border-rose-900/30 rounded-2xl text-rose-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-800/50 border border-white/10 rounded-xl focus:border-[#FF6B00] transition-all outline-none text-white placeholder-zinc-500"
                  placeholder="manager@gym.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-zinc-300">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#FF6B00] hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-800/50 border border-white/10 rounded-xl focus:border-[#FF6B00] transition-all outline-none text-white placeholder-zinc-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#FF6B00] hover:bg-[#FF8C39] text-black rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#FF6B00]/25 transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 border-none cursor-pointer"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="bg-zinc-800/30 p-6 text-center border-t border-white/5">
            <p className="text-sm text-zinc-400">
              Need assistance? <a href="#" className="text-[#FF6B00] font-bold">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
