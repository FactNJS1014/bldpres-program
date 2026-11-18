'use client';

import { useMemo, useState } from 'react';
import { Search, Trash2, Loader2 } from 'lucide-react';
import {
  classifyBloodPressure,
  formatThaiDateTime,
  PERIOD_LABELS,
  type BloodPressureRecord,
  type TimePeriodType,
} from '@/lib/bp-utils';

interface HistoryTableProps {
  logs: BloodPressureRecord[];
  onDeleted: (id: string) => void;
}

type PeriodFilter = 'ALL' | TimePeriodType;

export default function HistoryTable({ logs, onDeleted }: HistoryTableProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (periodFilter !== 'ALL' && log.period !== periodFilter) return false;
      if (q) {
        const noteMatch = (log.note || '').toLowerCase().includes(q);
        const bpMatch = `${log.systolic}/${log.diastolic}`.includes(q);
        const dateMatch = formatThaiDateTime(log.measuredAt).toLowerCase().includes(q);
        if (!noteMatch && !bpMatch && !dateMatch) return false;
      }
      return true;
    });
  }, [logs, periodFilter, search]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/bp/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted(id);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            ประวัติการวัดความดันโลหิต
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            แสดง {filteredLogs.length} จากทั้งหมด {logs.length} รายการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาหมายเหตุ หรือค่าความดัน..."
              className="h-9 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 w-56"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: 'ALL', label: 'ทั้งหมด' },
                { value: 'MORNING', label: 'เช้า' },
                { value: 'AFTERNOON', label: 'กลางวัน' },
                { value: 'EVENING', label: 'เย็น' },
              ] as { value: PeriodFilter; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriodFilter(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  periodFilter === opt.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg">
          <p className="text-sm font-medium text-slate-700">
            ไม่พบประวัติการวัดความดันโลหิต
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ลองเปลี่ยนตัวกรองหรือบันทึกค่าความดันใหม่จากแบบฟอร์มด้านบน
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">วันที่ / เวลา</th>
                <th className="py-3 px-3">ช่วงเวลา</th>
                <th className="py-3 px-3 text-right">ความดัน (mmHg)</th>
                <th className="py-3 px-3 text-right">ชีพจร (bpm)</th>
                <th className="py-3 px-3">เกณฑ์ประเมิน</th>
                <th className="py-3 px-3">หมายเหตุ</th>
                <th className="py-3 pl-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((log) => {
                const category = classifyBloodPressure(log.systolic, log.diastolic);
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatThaiDateTime(log.measuredAt)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {PERIOD_LABELS[log.period]}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                      {log.systolic}/{log.diastolic}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {log.pulse}
                    </td>
                    <td className={`py-3 px-3 font-medium whitespace-nowrap ${category.textClass}`}>
                      {category.shortLabel}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-[220px] truncate">
                      {log.note || '—'}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        aria-label="ลบรายการ"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === log.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
