'use client';

import { useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Activity,
  LayoutDashboard,
  PlusCircle,
  LineChart as LineChartIcon,
  History,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import BloodPressureForm from './BloodPressureForm';
import TrendChart from './TrendChart';
import WeeklySummaryPanel from './WeeklySummaryPanel';
import HistoryTable from './HistoryTable';
import PdfReportExporter from './PdfReportExporter';
import {
  classifyBloodPressure,
  computeWeeklySummary,
  formatThaiDateTime,
  PERIOD_LABELS,
  type BloodPressureRecord,
} from '@/lib/bp-utils';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
}

interface DashboardClientProps {
  user: UserInfo;
  initialLogs: BloodPressureRecord[];
}

type ActiveTab = 'overview' | 'record' | 'analytics' | 'history';

export default function DashboardClient({
  user,
  initialLogs,
}: DashboardClientProps) {
  const [logs, setLogs] = useState<BloodPressureRecord[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const summary = useMemo(() => computeWeeklySummary(logs), [logs]);
  const latestLog = logs[0] ?? null;
  const latestCategory = latestLog
    ? classifyBloodPressure(latestLog.systolic, latestLog.diastolic)
    : null;

  function handleCreated(newLog: BloodPressureRecord) {
    setLogs((prev) =>
      [newLog, ...prev].sort(
        (a, b) =>
          new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
      )
    );
  }

  function handleUpdated(updatedLog: BloodPressureRecord) {
    setLogs((prev) =>
      prev
        .map((item) => (item.id === updatedLog.id ? updatedLog : item))
        .sort(
          (a, b) =>
            new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
        )
    );
  }

  function handleDeleted(id: string) {
    setLogs((prev) => prev.filter((item) => item.id !== id));
  }

  const navItems: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'ภาพรวมสุขภาพ', icon: LayoutDashboard },
    { id: 'record', label: 'บันทึกความดัน', icon: PlusCircle },
    { id: 'analytics', label: 'กราฟและสรุปสัปดาห์', icon: LineChartIcon },
    { id: 'history', label: 'ประวัติการวัด', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            <Activity className="w-5 h-5 text-teal-700" />
            <span>PulseLog</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-teal-700' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {user.name}
            </div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col border-r border-slate-200 z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Activity className="w-5 h-5 text-teal-700" />
                <span>PulseLog</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="ปิดเมนู"
                className="p-2 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200">
              <div className="px-3 py-2 mb-2">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="เปิดเมนู"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 truncate">
              <span className="hidden sm:inline">แดชบอร์ด</span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <PdfReportExporter user={user} logs={logs} summary={summary} />
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Top KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">
                ค่าความดันล่าสุด
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {latestLog
                    ? `${latestLog.systolic}/${latestLog.diastolic}`
                    : '—'}
                </span>
                <span className="text-xs font-mono text-slate-500">mmHg</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {latestLog && latestCategory ? (
                  <span className={`font-medium ${latestCategory.textClass}`}>
                    {latestCategory.label}
                  </span>
                ) : (
                  <span>ยังไม่มีข้อมูล</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">
                ค่าเฉลี่ย 7 วันล่าสุด
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {summary.totalReadings > 0
                    ? `${summary.avgSystolic}/${summary.avgDiastolic}`
                    : '—'}
                </span>
                <span className="text-xs font-mono text-slate-500">mmHg</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
                จาก {summary.totalReadings} ครั้งในสัปดาห์นี้
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">
                ชีพจรเฉลี่ย 7 วัน
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {summary.totalReadings > 0 ? summary.avgPulse : '—'}
                </span>
                <span className="text-xs font-mono text-slate-500">bpm</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {latestLog
                  ? `ล่าสุด ${latestLog.pulse} bpm · ${PERIOD_LABELS[latestLog.period]}`
                  : 'เกณฑ์ปกติ 60–100 bpm'}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500">
                บันทึกล่าสุดเมื่อ
              </div>
              <div className="mt-2 text-base font-mono font-semibold tabular-nums text-slate-900">
                {latestLog ? formatThaiDateTime(latestLog.measuredAt) : '—'}
              </div>
              <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
                สะสมทั้งหมด {logs.length} รายการ
              </div>
            </div>
          </div>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-5">
                  <BloodPressureForm onCreated={handleCreated} />
                </div>
                <div className="xl:col-span-7">
                  <WeeklySummaryPanel summary={summary} />
                </div>
              </div>
              <TrendChart logs={logs} />
              <HistoryTable
                logs={logs}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            </div>
          )}

          {activeTab === 'record' && (
            <div className="max-w-2xl">
              <BloodPressureForm onCreated={handleCreated} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <WeeklySummaryPanel summary={summary} />
              <TrendChart logs={logs} />
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryTable
              logs={logs}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          )}
        </main>
      </div>
    </div>
  );
}
