'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signup } from '@/lib/auth';
import { OakAuthIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090c0a] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="p-2 rounded-lg border border-[#166534]/30 bg-[#166534]/10">
            <OakAuthIcon className="w-5 h-5 text-[#22c55e]" />
          </div>
          <span className="text-[18px] font-semibold tracking-tight text-white">OakAuth</span>
        </div>

        <div className="rounded-xl bg-[#0c0f0d] border border-white/[0.08] p-6">
          <h1 className="text-[18px] font-semibold text-white mb-1">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-[13px] text-white/40 mb-6">
            {isSignup ? 'Start securing your AI agents' : 'Sign in to your dashboard'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-[12px] text-white/50 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-[#090c0a] border border-white/[0.08] text-[14px] text-white placeholder-white/25 focus:outline-none focus:border-[#166534]/50 transition-colors"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-[12px] text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-[#090c0a] border border-white/[0.08] text-[14px] text-white placeholder-white/25 focus:outline-none focus:border-[#166534]/50 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-[12px] text-white/50 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-10 px-3 rounded-lg bg-[#090c0a] border border-white/[0.08] text-[14px] text-white placeholder-white/25 focus:outline-none focus:border-[#166534]/50 transition-colors"
                placeholder="Min 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#166534] text-white text-[14px] font-medium hover:bg-[#15803d] transition-colors disabled:opacity-50"
            >
              {loading ? '...' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-[13px] text-white/40 hover:text-white/60 transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
