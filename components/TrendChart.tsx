'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  formatThaiDate,
  PERIOD_LABELS,
  type BloodPressureRecord,
  type TimePeriodType,
} from '@/lib/bp-utils';

interface TrendChartProps {
  logs: BloodPressureRecord[];
}

type RangeOption = '7' | '14' | '30' | 'all';
type PeriodFilter = 'ALL' | TimePeriodType;

export default function TrendChart({ logs }: TrendChartProps) {
  const [range, setRange] = useState<RangeOption>('14');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [nowMs] = useState<number>(() => Date.now());

  const chartData = useMemo(() => {
    const filtered = logs
      .filter((log) => {
        if (periodFilter !== 'ALL' && log.period !== periodFilter) return false;
        if (range !== 'all') {
          const daysMs = Number(range) * 24 * 60 * 60 * 1000;
          if (nowMs - new Date(log.measuredAt).getTime() > daysMs) return false;
        }
        return true;
      })
      .slice()
      .sort(
        (a, b) =>
          new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
      );

    return filtered.map((log) => ({
      id: log.id,
      dateLabel: formatThaiDate(log.measuredAt),
      periodLabel: PERIOD_LABELS[log.period],
      systolic: log.systolic,
      diastolic: log.diastolic,
      pulse: log.pulse,
    }));
  }, [logs, range, periodFilter, nowMs]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            กราฟแนวโน้มความดันโลหิต
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-teal-700 inline-block" />
              ตัวบน (Systolic)
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-600 inline-block" />
              ตัวล่าง (Diastolic)
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-600 inline-block" />
              ชีพจร (Pulse)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: 'ALL', label: 'ทุกช่วง' },
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

          {/* Range Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: '7', label: '7 วัน' },
                { value: '14', label: '14 วัน' },
                { value: '30', label: '30 วัน' },
                { value: 'all', label: 'ทั้งหมด' },
              ] as { value: RangeOption; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  range === opt.value
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

      {chartData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg px-4">
          <p className="text-sm font-medium text-slate-700">
            ยังไม่มีข้อมูลในช่วงเวลาที่เลือก
          </p>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกค่าความดันโลหิตอย่างน้อย 1 รายการเพื่อแสดงกราฟแนวโน้ม
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
                formatter={(value, name) => {
                  if (name === 'systolic') return [`${value} mmHg`, 'ตัวบน (SYS)'];
                  if (name === 'diastolic') return [`${value} mmHg`, 'ตัวล่าง (DIA)'];
                  return [`${value} bpm`, 'ชีพจร (PUL)'];
                }}
                labelFormatter={(label, payload) => {
                  const period = payload?.[0]?.payload?.periodLabel;
                  return period ? `${label} · ${period}` : String(label);
                }}
              />
              <ReferenceLine
                y={120}
                stroke="#16A34A"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
              <ReferenceLine
                y={80}
                stroke="#16A34A"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#0F766E"
                strokeWidth={2.25}
                dot={{ r: 3.5, fill: '#0F766E' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#475569"
                strokeWidth={2}
                dot={{ r: 3, fill: '#475569' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="pulse"
                stroke="#D97706"
                strokeWidth={1.75}
                strokeDasharray="4 3"
                dot={{ r: 2.5, fill: '#D97706' }}
                activeDot={{ r: 4.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
