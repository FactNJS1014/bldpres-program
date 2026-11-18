'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  Pencil,
  Loader2,
  X,
  Sun,
  CloudSun,
  Moon,
} from 'lucide-react';
import {
  classifyBloodPressure,
  formatThaiDateTime,
  PERIOD_LABELS,
  type BloodPressureRecord,
  type TimePeriodType,
} from '@/lib/bp-utils';

interface HistoryTableProps {
  logs: BloodPressureRecord[];
  onUpdated: (record: BloodPressureRecord) => void;
  onDeleted: (id: string) => void;
}

type PeriodFilter = 'ALL' | TimePeriodType;

function toLocalDateTimeInput(isoString: string): string {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function HistoryTable({
  logs,
  onUpdated,
  onDeleted,
}: HistoryTableProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit modal state
  const [editingLog, setEditingLog] = useState<BloodPressureRecord | null>(null);
  const [editPeriod, setEditPeriod] = useState<TimePeriodType>('MORNING');
  const [editSystolic, setEditSystolic] = useState('');
  const [editDiastolic, setEditDiastolic] = useState('');
  const [editPulse, setEditPulse] = useState('');
  const [editMeasuredAt, setEditMeasuredAt] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

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

  function openEditModal(log: BloodPressureRecord) {
    setEditingLog(log);
    setEditPeriod(log.period);
    setEditSystolic(String(log.systolic));
    setEditDiastolic(String(log.diastolic));
    setEditPulse(String(log.pulse));
    setEditMeasuredAt(toLocalDateTimeInput(log.measuredAt));
    setEditNote(log.note || '');
    setEditError('');
  }

  function closeEditModal() {
    if (editSaving) return;
    setEditingLog(null);
    setEditError('');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLog) return;
    setEditSaving(true);
    setEditError('');

    try {
      const res = await fetch(`/api/bp/${editingLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systolic: Number(editSystolic),
          diastolic: Number(editDiastolic),
          pulse: Number(editPulse),
          period: editPeriod,
          note: editNote,
          measuredAt: new Date(editMeasuredAt).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'ไม่สามารถแก้ไขข้อมูลได้');
        setEditSaving(false);
        return;
      }

      onUpdated(data.log);
      setEditingLog(null);
    } catch {
      setEditError('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
    } finally {
      setEditSaving(false);
    }
  }

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

  const editPreviewCategory =
    !Number.isNaN(Number(editSystolic)) &&
    !Number.isNaN(Number(editDiastolic)) &&
    Number(editSystolic) >= 50 &&
    Number(editDiastolic) >= 30
      ? classifyBloodPressure(Number(editSystolic), Number(editDiastolic))
      : null;

  const periodOptions: { value: TimePeriodType; icon: typeof Sun }[] = [
    { value: 'MORNING', icon: Sun },
    { value: 'AFTERNOON', icon: CloudSun },
    { value: 'EVENING', icon: Moon },
  ];

  return (
    <>
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
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(log)}
                            aria-label="แก้ไขรายการ"
                            title="แก้ไข"
                            className="p-1.5 text-slate-400 hover:text-teal-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(log.id)}
                            disabled={deletingId === log.id}
                            aria-label="ลบรายการ"
                            title="ลบ"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === log.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editingLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-bp-title"
        >
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3
                  id="edit-bp-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  แก้ไขบันทึกความดันโลหิต
                </h3>
                {editPreviewCategory && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    ประเมินเบื้องต้น ·{' '}
                    <span className={`font-semibold ${editPreviewCategory.textClass}`}>
                      {editPreviewCategory.label}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label="ปิดหน้าต่าง"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div
                role="alert"
                className="mb-4 px-3.5 py-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ช่วงเวลาที่วัด
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                  {periodOptions.map(({ value, icon: Icon }) => {
                    const active = editPeriod === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEditPeriod(value)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-teal-700' : 'text-slate-400'
                          }`}
                        />
                        <span>{PERIOD_LABELS[value]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="edit-systolic"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    ตัวบน (mmHg)
                  </label>
                  <input
                    id="edit-systolic"
                    type="number"
                    required
                    min={50}
                    max={260}
                    value={editSystolic}
                    onChange={(e) => setEditSystolic(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-diastolic"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    ตัวล่าง (mmHg)
                  </label>
                  <input
                    id="edit-diastolic"
                    type="number"
                    required
                    min={30}
                    max={180}
                    value={editDiastolic}
                    onChange={(e) => setEditDiastolic(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-pulse"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    ชีพจร (bpm)
                  </label>
                  <input
                    id="edit-pulse"
                    type="number"
                    required
                    min={30}
                    max={220}
                    value={editPulse}
                    onChange={(e) => setEditPulse(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-mono font-semibold tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-measured-at"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  วันที่และเวลาที่วัด
                </label>
                <input
                  id="edit-measured-at"
                  type="datetime-local"
                  required
                  value={editMeasuredAt}
                  onChange={(e) => setEditMeasuredAt(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-note"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  หมายเหตุเพิ่มเติม
                </label>
                <input
                  id="edit-note"
                  type="text"
                  maxLength={300}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="เช่น หลังตื่นนอน, หลังทานยาความดัน"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editSaving}
                  className="h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="h-10 px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึกการแก้ไข</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
