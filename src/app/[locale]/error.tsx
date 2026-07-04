'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('PAGE ERROR CAUGHT:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-[#151515] rounded-2xl shadow-2xl border border-white/5 p-10 max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-zinc-400 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#FF6B00] text-black rounded-xl font-bold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
