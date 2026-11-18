'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      window.location.assign('/dashboard');
    } catch {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <Activity className="w-5 h-5 text-teal-700" />
            <span>PulseLog</span>
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
          >
            สร้างบัญชีใหม่
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              เข้าถึงบันทึกความดันโลหิต กราฟแนวโน้ม และรายงานสุขภาพของคุณ
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
            ยังไม่มีบัญชีผู้ใช้?{' '}
            <Link
              href="/register"
              className="font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              ลงทะเบียนฟรี
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
