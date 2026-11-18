'use client';

import { useRef, useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  classifyBloodPressure,
  formatThaiDate,
  formatThaiDateTime,
  PERIOD_LABELS,
  type BloodPressureRecord,
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
  summary?: WeeklySummary;
}

export default function PdfReportExporter({
  user,
  logs,
}: PdfReportExporterProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleExportPdf() {
    if (!reportRef.current) return;
    setExporting(true);
    setErrorMsg('');

    try {

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          clonedDoc
            .querySelectorAll('style, link[rel="stylesheet"]')
            .forEach((el) => el.remove());

          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #ffffff; color: #0f172a; font-family: "IBM Plex Sans Thai", "Plus Jakarta Sans", sans-serif; }
          `;
          clonedDoc.head.appendChild(style);
        },
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
      const filename = `PulseLog-History-${dateSlug}.pdf`;
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('PDF export error:', error);
      setErrorMsg('ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {errorMsg && (
          <span className="text-xs text-red-600 hidden sm:inline">
            {errorMsg}
          </span>
        )}
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
      </div>

      {/* Offscreen A4 Report: History Table Only */}
      <div
        aria-hidden="true"
        ref={reportRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '36px 40px',
          fontFamily: '"IBM Plex Sans Thai", "Plus Jakarta Sans", sans-serif',
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            borderBottom: '2px solid #0f766e',
            paddingBottom: '12px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              ตารางประวัติการบันทึกความดันโลหิต
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              ผู้ใช้งาน: {user.name}
              {user.age ? ` · อายุ ${user.age} ปี` : ''}
              {user.gender ? ` · เพศ${user.gender}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
            <div>วันที่ออกรายงาน: {formatThaiDate(new Date())}</div>
            <div>ทั้งหมด {logs.length} รายการ</div>
          </div>
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #cbd5e1',
                borderBottom: '1px solid #cbd5e1',
                color: '#334155',
              }}
            >
              <th style={{ padding: '9px 8px' }}>วันที่ / เวลา</th>
              <th style={{ padding: '9px 8px' }}>ช่วงเวลา</th>
              <th style={{ padding: '9px 8px', textAlign: 'right' }}>
                ความดัน (mmHg)
              </th>
              <th style={{ padding: '9px 8px', textAlign: 'right' }}>
                ชีพจร (bpm)
              </th>
              <th style={{ padding: '9px 8px' }}>เกณฑ์ประเมิน</th>
              <th style={{ padding: '9px 8px' }}>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '28px 0',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  ยังไม่มีรายการบันทึกความดันโลหิต
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => {
                const cat = classifyBloodPressure(log.systolic, log.diastolic);
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '8px', color: '#334155' }}>
                      {formatThaiDateTime(log.measuredAt)}
                    </td>
                    <td style={{ padding: '8px', color: '#334155' }}>
                      {PERIOD_LABELS[log.period]}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#0f172a',
                      }}
                    >
                      {log.systolic}/{log.diastolic}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        color: '#334155',
                      }}
                    >
                      {log.pulse}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        fontWeight: 600,
                        color: cat.dotColor,
                      }}
                    >
                      {cat.shortLabel}
                    </td>
                    <td style={{ padding: '8px', color: '#475569' }}>
                      {log.note || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
