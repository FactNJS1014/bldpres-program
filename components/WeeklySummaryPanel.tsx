'use client';

import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  PERIOD_LABELS,
  type TimePeriodType,
  type WeeklySummary,
} from '@/lib/bp-utils';

interface WeeklySummaryPanelProps {
  summary: WeeklySummary;
}

export default function WeeklySummaryPanel({ summary }: WeeklySummaryPanelProps) {
  const periods: TimePeriodType[] = ['MORNING', 'AFTERNOON', 'EVENING'];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            สรุปผลรายสัปดาห์อัตโนมัติ
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            คำนวณจากบันทึกในรอบ 7 วันล่าสุดเปรียบเทียบกับสัปดาห์ก่อนหน้า
          </p>
        </div>
        {summary.category && (
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>เกณฑ์เฉลี่ย</span>
            <span aria-hidden="true">·</span>
            <span className={`font-semibold ${summary.category.textClass}`}>
              {summary.category.label}
            </span>
          </div>
        )}
      </div>

      {/* Automated Clinical Summary Prose */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg mb-6">
        <p className="text-sm text-slate-700 leading-relaxed">
          {summary.summaryText}
        </p>
      </div>

      {summary.totalReadings > 0 && (
        <div className="space-y-6">
          {/* Period Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 mb-3">
              ค่าเฉลี่ยแยกตามช่วงเวลา (7 วันล่าสุด)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {periods.map((period) => {
                const stat = summary.byPeriod[period];
                return (
                  <div
                    key={period}
                    className="p-3.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-medium text-slate-700">
                        {PERIOD_LABELS[period]}
                      </span>
                      <span className="font-mono tabular-nums">
                        {stat ? `${stat.count} ครั้ง` : '0 ครั้ง'}
                      </span>
                    </div>
                    {stat ? (
                      <>
                        <div className="text-lg font-mono font-bold tabular-nums text-slate-900">
                          {stat.avgSystolic}/{stat.avgDiastolic}
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            mmHg
                          </span>
                        </div>
                        <div className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                          ชีพจรเฉลี่ย {stat.avgPulse} bpm
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-400 py-1.5">
                        ยังไม่มีบันทึก
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Min/Max & Week-over-Week Delta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block mb-1">
                ช่วงค่าต่ำสุด – สูงสุด (7 วัน)
              </span>
              <div className="text-sm font-mono tabular-nums text-slate-900">
                ตัวบน{' '}
                <span className="font-semibold">
                  {summary.minSystolic}–{summary.maxSystolic}
                </span>{' '}
                mmHg
                <span className="mx-2 text-slate-300">·</span>
                ตัวล่าง{' '}
                <span className="font-semibold">
                  {summary.minDiastolic}–{summary.maxDiastolic}
                </span>{' '}
                mmHg
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">
                เทียบกับสัปดาห์ก่อนหน้า
              </span>
              {summary.systolicDelta !== null && summary.diastolicDelta !== null ? (
                <div className="flex items-center gap-2 text-sm font-mono tabular-nums text-slate-900">
                  {summary.systolicDelta < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : summary.systolicDelta > 0 ? (
                    <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <Minus className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span>
                    SYS {summary.systolicDelta > 0 ? `+${summary.systolicDelta}` : summary.systolicDelta} / DIA{' '}
                    {summary.diastolicDelta > 0 ? `+${summary.diastolicDelta}` : summary.diastolicDelta} mmHg
                  </span>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  รอข้อมูลสัปดาห์ก่อนหน้าเพื่อเปรียบเทียบ
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
