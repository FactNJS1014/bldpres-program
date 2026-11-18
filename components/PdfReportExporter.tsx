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
  const [errorMsg, setErrorMsg] = useState('');

  async function handleExportPdf() {
    if (!reportRef.current) return;
    setExporting(true);
    setErrorMsg('');

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Remove Tailwind v4 stylesheets that contain oklch() unsupported by html2canvas
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
      const filename = `PulseLog-Health-Report-${dateSlug}.pdf`;
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

  const recentLogs = logs.slice(0, 25);
  const periods: TimePeriodType[] = ['MORNING', 'AFTERNOON', 'EVENING'];

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

      {/* Offscreen A4 Clinical Report using pure hex/rgb inline styles for html2canvas compatibility */}
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
          padding: '40px',
          fontFamily: '"IBM Plex Sans Thai", "Plus Jakarta Sans", sans-serif',
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: '2px solid #0f766e',
            paddingBottom: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0f766e',
                letterSpacing: '0.06em',
              }}
            >
              PULSELOG CLINICAL SUMMARY
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#0f172a',
                marginTop: '4px',
              }}
            >
              รายงานสรุปผลความดันโลหิตเพื่อปรึกษาแพทย์
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
            <div>วันที่ออกรายงาน: {formatThaiDate(new Date())}</div>
            <div>จำนวนบันทึกทั้งหมด: {logs.length} รายการ</div>
          </div>
        </div>

        {/* Patient Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '13px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              ชื่อผู้ป่วย / ผู้ใช้งาน
            </div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              {user.name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>อีเมลติดต่อ</div>
            <div style={{ fontWeight: 500, color: '#1e293b', marginTop: '2px' }}>
              {user.email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>ข้อมูลพื้นฐาน</div>
            <div style={{ fontWeight: 500, color: '#1e293b', marginTop: '2px' }}>
              {user.gender ? `เพศ${user.gender}` : 'ไม่ระบุเพศ'} ·{' '}
              {user.age ? `อายุ ${user.age} ปี` : 'ไม่ระบุอายุ'}
            </div>
          </div>
        </div>

        {/* 7-Day Automated Summary */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
            }}
          >
            สรุปผลรอบ 7 วันล่าสุด
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#334155',
              marginBottom: '16px',
            }}
          >
            {summary.summaryText}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            <div
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                ความดันเฉลี่ย 7 วัน
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: '4px',
                }}
              >
                {summary.totalReadings > 0
                  ? `${summary.avgSystolic}/${summary.avgDiastolic}`
                  : '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>mmHg</div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                ชีพจรเฉลี่ย 7 วัน
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: '4px',
                }}
              >
                {summary.totalReadings > 0 ? summary.avgPulse : '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>bpm</div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                ตัวบน ต่ำสุด–สูงสุด
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: '4px',
                }}
              >
                {summary.totalReadings > 0
                  ? `${summary.minSystolic}–${summary.maxSystolic}`
                  : '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>mmHg</div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b' }}>เกณฑ์เฉลี่ย</div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#115e59',
                  marginTop: '6px',
                }}
              >
                {summary.category ? summary.category.label : 'ไม่มีข้อมูล'}
              </div>
            </div>
          </div>
        </div>

        {/* Period Averages */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
            }}
          >
            ค่าเฉลี่ยแยกตามช่วงเวลา (7 วันล่าสุด)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {periods.map((p) => {
              const stat = summary.byPeriod[p];
              return (
                <div
                  key={p}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {PERIOD_LABELS[p]} ({stat ? stat.count : 0} ครั้ง)
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginTop: '4px',
                    }}
                  >
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
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
            }}
          >
            ตารางบันทึกการวัดความดันล่าสุด (สูงสุด 25 รายการ)
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
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                <th style={{ padding: '8px 6px 8px 0' }}>วันที่ / เวลา</th>
                <th style={{ padding: '8px 6px' }}>ช่วงเวลา</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>
                  SYS/DIA (mmHg)
                </th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>ชีพจร</th>
                <th style={{ padding: '8px 6px' }}>เกณฑ์</th>
                <th style={{ padding: '8px 0 8px 6px' }}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '24px 0',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    ยังไม่มีรายการบันทึกความดันโลหิต
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => {
                  const cat = classifyBloodPressure(log.systolic, log.diastolic);
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: '1px solid #e2e8f0' }}
                    >
                      <td style={{ padding: '7px 6px 7px 0', color: '#334155' }}>
                        {formatThaiDateTime(log.measuredAt)}
                      </td>
                      <td style={{ padding: '7px 6px', color: '#334155' }}>
                        {PERIOD_LABELS[log.period]}
                      </td>
                      <td
                        style={{
                          padding: '7px 6px',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        {log.systolic}/{log.diastolic}
                      </td>
                      <td
                        style={{
                          padding: '7px 6px',
                          textAlign: 'right',
                          color: '#334155',
                        }}
                      >
                        {log.pulse}
                      </td>
                      <td
                        style={{
                          padding: '7px 6px',
                          fontWeight: 600,
                          color: cat.dotColor,
                        }}
                      >
                        {cat.shortLabel}
                      </td>
                      <td style={{ padding: '7px 0 7px 6px', color: '#475569' }}>
                        {log.note || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0',
            fontSize: '11px',
            color: '#94a3b8',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>สร้างโดยระบบ PulseLog Health Dashboard</span>
          <span>เอกสารนี้จัดทำขึ้นเพื่อประกอบการปรึกษาแพทย์</span>
        </div>
      </div>
    </>
  );
}
