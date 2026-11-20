import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {
  Activity,
  ArrowRight,
  Clock,
  LineChart,
  FileDown,
  ShieldCheck,
} from 'lucide-react';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 zones */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <Activity className="w-5 h-5 text-teal-700" />
            <span>PulseLog</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#features"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              ฟีเจอร์หลัก
            </a>
            <a
              href="#workflow"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              ขั้นตอนการใช้งาน
            </a>
            <a
              href="#guidelines"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              เกณฑ์ความดันโลหิต
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>ไปที่แดชบอร์ด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="h-9 px-4 inline-flex items-center justify-center text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight text-balance">
                บันทึกความดันโลหิตรายวันอย่างเป็นระบบ พร้อมสรุปผลปรึกษาแพทย์
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                ติดตามค่าความดันตัวบน ตัวล่าง และชีพจรครบทั้งช่วงเช้า กลางวัน และเย็น
                วิเคราะห์กราฟแนวโน้ม สรุปผลรายสัปดาห์อัตโนมัติ และส่งออกรายงานสุขภาพเป็นไฟล์
                PDF ได้ทันที
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="h-12 px-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>
                    {isAuthenticated ? 'เปิดแดชบอร์ดของคุณ' : 'เริ่มใช้งานฟรี'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="h-12 px-6 inline-flex items-center justify-center text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    เข้าสู่ระบบด้วยบัญชีที่มีอยู่
                  </Link>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>บันทึกแยกช่วงเช้า · กลางวัน · เย็น</span>
                <span aria-hidden="true">/</span>
                <span>จัดเก็บปลอดภัยบน Neon PostgreSQL</span>
                <span aria-hidden="true">/</span>
                <span>ส่งออก PDF ภาษาไทยคมชัด</span>
              </div>
            </div>

            {/* Clinical Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-xs text-slate-500">ตัวอย่างสรุปผลรายสัปดาห์</div>
                    <div className="text-base font-semibold text-slate-900 mt-0.5">
                      ค่าเฉลี่ยความดัน 7 วันล่าสุด
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-emerald-700">
                    ความดันปกติ
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                    <div className="text-xs text-slate-500">ช่วงเช้า</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 mt-1">
                      118/76
                    </div>
                    <div className="text-xs font-mono text-slate-500">70 bpm</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                    <div className="text-xs text-slate-500">ช่วงกลางวัน</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 mt-1">
                      122/79
                    </div>
                    <div className="text-xs font-mono text-slate-500">74 bpm</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                    <div className="text-xs text-slate-500">ช่วงเย็น</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 mt-1">
                      119/77
                    </div>
                    <div className="text-xs font-mono text-slate-500">71 bpm</div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed pt-1">
                  ระบบคำนวณค่าเฉลี่ยรายช่วงเวลา ช่วงต่ำสุด–สูงสุด และเปรียบเทียบแนวโน้มกับสัปดาห์ก่อนหน้าโดยอัตโนมัติ
                  พร้อมจัดรูปแบบเอกสาร A4 สำหรับยื่นให้แพทย์ผู้ตรวจ
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="border-t border-slate-200 bg-white py-16 lg:py-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                ครบทุกเครื่องมือสำหรับการดูแลความดันโลหิต
              </h2>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                ออกแบบมาเพื่อความเรียบง่าย อ่านค่าง่ายด้วยตัวเลขแบบ Tabular และเชื่อมโยงข้อมูลได้จริง
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/40">
                <Clock className="w-5 h-5 text-teal-700 mb-4" />
                <h3 className="text-base font-semibold text-slate-900">
                  บันทึกครบ 3 ช่วงเวลา
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  แยกบันทึกช่วงเช้า กลางวัน และเย็น พร้อมหมายเหตุประกอบการวัด เช่น
                  ก่อนอาหาร หรือหลังรับประทานยา
                </p>
              </div>

              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/40">
                <LineChart className="w-5 h-5 text-teal-700 mb-4" />
                <h3 className="text-base font-semibold text-slate-900">
                  กราฟแนวโน้มและสรุปสัปดาห์
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  แสดงกราฟเปรียบเทียบค่าตัวบน ตัวล่าง และชีพจร พร้อมสรุปผลอัตโนมัติรอบ 7
                  วันเทียบกับสัปดาห์ก่อน
                </p>
              </div>

              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/40">
                <FileDown className="w-5 h-5 text-teal-700 mb-4" />
                <h3 className="text-base font-semibold text-slate-900">
                  ส่งออกไฟล์ PDF ปรึกษาแพทย์
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  สร้างรายงานสุขภาพขนาด A4 ที่มีข้อมูลผู้ป่วย ค่าเฉลี่ยรายช่วงเวลา
                  และตารางประวัติล่าสุดในคลิกเดียว
                </p>
              </div>

              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/40">
                <ShieldCheck className="w-5 h-5 text-teal-700 mb-4" />
                <h3 className="text-base font-semibold text-slate-900">
                  ปลอดภัยด้วย NextAuth &amp; Prisma
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  ยืนยันตัวตนด้วยรหัสผ่านเข้ารหัส และจัดเก็บประวัติสุขภาพแยกตามบัญชีผู้ใช้บน
                  Neon PostgreSQL
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines Reference Table */}
        <section id="guidelines" className="py-16 lg:py-20 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4" id="workflow">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  เกณฑ์ประเมินความดันโลหิตมาตรฐาน
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  ระบบจะจัดกลุ่มค่าความดันของคุณให้อัตโนมัติทุกครั้งที่บันทึก เพื่อช่วยให้สังเกตความเปลี่ยนแปลงได้ชัดเจน
                </p>
              </div>

              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">ระดับความดันโลหิต</th>
                      <th className="py-3 px-4 text-right">ตัวบน (mmHg)</th>
                      <th className="py-3 px-4 text-right">ตัวล่าง (mmHg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-medium text-emerald-700">ความดันที่ดี</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">&lt; 120</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">&lt; 80</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-sky-700">ความดันปกติ</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">120 – 129</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">80 – 84</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-sky-800">ความดันค่อนข้างสูง</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">130 – 139</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">85 – 89</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-amber-600">ความดันสูงเล็กน้อย</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">140 – 159</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">90 – 99</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-orange-700">ความดันสูงปานกลาง</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">160 – 179</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">100 – 109</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-red-700">ความดันสูงมาก</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">&ge; 180</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">&ge; 110</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-amber-800">ความดันตัวบนสูง (ISH)</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">&ge; 140</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">&lt; 90</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>PulseLog — ระบบบันทึกและติดตามความดันโลหิตส่วนบุคคล</span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="hover:text-slate-900 transition-colors">
              ลงทะเบียน
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
