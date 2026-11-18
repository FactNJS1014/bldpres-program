'use client';

import { useRef, useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import {
  classifyBloodPressure,
  formatThaiDate,
  formatThaiDateTime,
  PERIOD_LABELS,
  type BloodPressureRecord,
  type TimePeriodType,
  type WeeklySummary,
} from '@/lib/bp-utils';

interface UserProfileInfo {
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
}

interface PdfReportExporterProps {
  user: UserProfileInfo;
  logs: BloodPressureRecord[];
  summary: WeeklySummary;
}

export default function PdfReportExporter({
  user,
  logs,
  summary,
}: PdfReportExporterProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExportPdf() {
    if (!reportRef.current) return;
    setExporting(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const dateSlug = new Date().toISOString().slice(0, 10);
      pdf.save(`PulseLog-Health-Report-${dateSlug}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setExporting(false);
    }
  }

  const recentLogs = logs.slice(0, 25);
  const periods: TimePeriodType[] = ['MORNING', 'AFTERNOON', 'EVENING'];

  return (
    <>
      <button
        type="button"
        onClick={handleExportPdf}
        disabled={exporting}
        className="h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>กำลังสร้าง PDF...</span>
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            <span>ส่งออกรายงาน PDF</span>
          </>
        )}
      </button>

      {/* Offscreen A4 Clinical Report for Crisp Thai PDF Rendering */}
      <div
        aria-hidden="true"
        className="fixed -left-[9999px] top-0 w-[794px] bg-white text-slate-900 p-10"
        ref={reportRef}
      >
        <div className="border-b-2 border-teal-700 pb-4 mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold text-teal-700 tracking-wide">
              PULSELOG CLINICAL SUMMARY
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              รายงานสรุปผลความดันโลหิตเพื่อปรึกษาแพทย์
            </h1>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>วันที่ออกรายงาน: {formatThaiDate(new Date())}</div>
            <div>จำนวนบันทึกทั้งหมด: {logs.length} รายการ</div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-sm">
          <div>
            <div className="text-xs text-slate-500">ชื่อผู้ป่วย / ผู้ใช้งาน</div>
            <div className="font-semibold text-slate-900 mt-0.5">{user.name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">อีเมลติดต่อ</div>
            <div className="font-medium text-slate-800 mt-0.5">{user.email}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">ข้อมูลพื้นฐาน</div>
            <div className="font-medium text-slate-800 mt-0.5">
              {user.gender ? `เพศ${user.gender}` : 'ไม่ระบุเพศ'} ·{' '}
              {user.age ? `อายุ ${user.age} ปี` : 'ไม่ระบุอายุ'}
            </div>
          </div>
        </div>

        {/* 7-Day Automated Summary */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">
            สรุปผลรอบ 7 วันล่าสุด
          </h2>
          <p className="text-sm text-slate-700 mb-4 leading-relaxed">
            {summary.summaryText}
          </p>

          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">ความดันเฉลี่ย 7 วัน</div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {summary.totalReadings > 0
                  ? `${summary.avgSystolic}/${summary.avgDiastolic}`
                  : '—'}
              </div>
              <div className="text-xs text-slate-500">mmHg</div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">ชีพจรเฉลี่ย 7 วัน</div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {summary.totalReadings > 0 ? summary.avgPulse : '—'}
              </div>
              <div className="text-xs text-slate-500">bpm</div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">ตัวบน ต่ำสุด–สูงสุด</div>
              <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                {summary.totalReadings > 0
                  ? `${summary.minSystolic}–${summary.maxSystolic}`
                  : '—'}
              </div>
              <div className="text-xs text-slate-500">mmHg</div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">เกณฑ์เฉลี่ย</div>
              <div className="text-sm font-bold text-teal-800 mt-1.5">
                {summary.category ? summary.category.label : 'ไม่มีข้อมูล'}
              </div>
            </div>
          </div>
        </div>

        {/* Period Averages */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-2">
            ค่าเฉลี่ยแยกตามช่วงเวลา (7 วันล่าสุด)
          </h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {periods.map((p) => {
              const stat = summary.byPeriod[p];
              return (
                <div key={p} className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500">
                    {PERIOD_LABELS[p]} ({stat ? stat.count : 0} ครั้ง)
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-1">
                    {stat
                      ? `${stat.avgSystolic}/${stat.avgDiastolic} mmHg · ${stat.avgPulse} bpm`
                      : 'ไม่มีข้อมูล'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Logs Table */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-2">
            ตารางบันทึกการวัดความดันล่าสุด (สูงสุด 25 รายการ)
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600">
                <th className="py-2 pr-2">วันที่ / เวลา</th>
                <th className="py-2 px-2">ช่วงเวลา</th>
                <th className="py-2 px-2 text-right">SYS/DIA (mmHg)</th>
                <th className="py-2 px-2 text-right">ชีพจร</th>
                <th className="py-2 px-2">เกณฑ์</th>
                <th className="py-2 pl-2">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    ยังไม่มีรายการบันทึกความดันโลหิต
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => {
                  const cat = classifyBloodPressure(log.systolic, log.diastolic);
                  return (
                    <tr key={log.id}>
                      <td className="py-2 pr-2 font-mono text-slate-700">
                        {formatThaiDateTime(log.measuredAt)}
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        {PERIOD_LABELS[log.period]}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-semibold text-slate-900">
                        {log.systolic}/{log.diastolic}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-700">
                        {log.pulse}
                      </td>
                      <td className="py-2 px-2 font-medium text-slate-800">
                        {cat.shortLabel}
                      </td>
                      <td className="py-2 pl-2 text-slate-600">
                        {log.note || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex justify-between">
          <span>สร้างโดยระบบ PulseLog Health Dashboard</span>
          <span>เอกสารนี้จัดทำขึ้นเพื่อประกอบการปรึกษาแพทย์</span>
        </div>
      </div>
    </>
  );
}
