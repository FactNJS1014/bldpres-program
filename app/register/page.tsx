'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          age: age ? Number(age) : null,
          gender: gender || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'ไม่สามารถลงทะเบียนได้');
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/login');
        return;
      }

      window.location.assign('/dashboard');
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
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
            href="/login"
            className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              ลงทะเบียนผู้ใช้ใหม่
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              สร้างบัญชีเพื่อบันทึกความดันโลหิตรายวันและส่งออกรายงานปรึกษาแพทย์
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                ชื่อ-นามสกุล
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 transition-colors"
              />
            </div>

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
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กำหนดรหัสผ่าน"
                className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  อายุ (ไม่บังคับ)
                </label>
                <input
                  id="age"
                  type="number"
                  min={1}
                  max={130}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="เช่น 45"
                  className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  เพศ (ไม่บังคับ)
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 transition-colors"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างบัญชี...</span>
                </>
              ) : (
                <>
                  <span>ลงทะเบียนและเริ่มต้นใช้งาน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link
              href="/login"
              className="font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
