'use client';

import { useState } from 'react';
import { Sun, CloudSun, Moon, Plus, Loader2, Check } from 'lucide-react';
import {
  classifyBloodPressure,
  PERIOD_LABELS,
  PERIOD_TIME_HINTS,
  type BloodPressureRecord,
  type TimePeriodType,
} from '@/lib/bp-utils';

interface BloodPressureFormProps {
  onCreated: (record: BloodPressureRecord) => void;
}

function getDefaultPeriod(): TimePeriodType {
  const hour = new Date().getHours();
  if (hour < 12) return 'MORNING';
  if (hour < 18) return 'AFTERNOON';
  return 'EVENING';
}

function getLocalDateTimeValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export default function BloodPressureForm({ onCreated }: BloodPressureFormProps) {
  const [period, setPeriod] = useState<TimePeriodType>(getDefaultPeriod);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [measuredAt, setMeasuredAt] = useState(getLocalDateTimeValue);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const sysNum = Number(systolic);
  const diaNum = Number(diastolic);
  const previewCategory =
    !Number.isNaN(sysNum) && !Number.isNaN(diaNum) && sysNum >= 50 && diaNum >= 30
      ? classifyBloodPressure(sysNum, diaNum)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSavedNotice(false);
    setSubmitting(true);

    try {
      const res = await fetch('/api/bp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systolic: Number(systolic),
          diastolic: Number(diastolic),
          pulse: Number(pulse),
          period,
          note,
          measuredAt: new Date(measuredAt).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
        setSubmitting(false);
        return;
      }

      onCreated(data.log);
      setNote('');
      setMeasuredAt(getLocalDateTimeValue());
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
    } finally {
      setSubmitting(false);
    }
  }

  const periodOptions: { value: TimePeriodType; icon: typeof Sun }[] = [
    { value: 'MORNING', icon: Sun },
    { value: 'AFTERNOON', icon: CloudSun },
    { value: 'EVENING', icon: Moon },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            บันทึกความดันโลหิตรายวัน
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            เลือกช่วงเวลาที่วัดและกรอกค่าตัวบน ตัวล่าง และชีพจร
          </p>
        </div>
        {previewCategory && (
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>ประเมินเบื้องต้น</span>
            <span aria-hidden="true">·</span>
            <span className={`font-semibold ${previewCategory.textClass}`}>
              {previewCategory.label}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Period Segmented Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ช่วงเวลาที่วัด
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
            {periodOptions.map(({ value, icon: Icon }) => {
              const active = period === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{PERIOD_LABELS[value]}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            ช่วงเวลาแนะนำสำหรับ{PERIOD_LABELS[period]}: {PERIOD_TIME_HINTS[period]} น.
          </p>
        </div>

        {/* Numeric Readings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="bp-systolic"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              ตัวบน (Systolic)
            </label>
            <div className="relative">
              <input
                id="bp-systolic"
                type="number"
                required
                min={50}
                max={260}
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full h-11 pl-3.5 pr-16 text-base font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                mmHg
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="bp-diastolic"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              ตัวล่าง (Diastolic)
            </label>
            <div className="relative">
              <input
                id="bp-diastolic"
                type="number"
                required
                min={30}
                max={180}
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full h-11 pl-3.5 pr-16 text-base font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                mmHg
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="bp-pulse"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              ชีพจร (Pulse)
            </label>
            <div className="relative">
              <input
                id="bp-pulse"
                type="number"
                required
                min={30}
                max={220}
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full h-11 pl-3.5 pr-14 text-base font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                bpm
              </span>
            </div>
          </div>
        </div>

        {/* Date/Time & Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="bp-measured-at"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              วันที่และเวลาที่วัด
            </label>
            <input
              id="bp-measured-at"
              type="datetime-local"
              required
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="bp-note"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              หมายเหตุเพิ่มเติม (ไม่บังคับ)
            </label>
            <input
              id="bp-note"
              type="text"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น หลังตื่นนอน, หลังทานยาความดัน"
              className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            {savedNotice ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <Check className="w-4 h-4" />
                บันทึกข้อมูลเรียบร้อยแล้ว
              </span>
            ) : (
              <span>ควรนั่งพักอย่างน้อย 5 นาทีก่อนวัดความดัน</span>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>บันทึกค่าความดัน</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
