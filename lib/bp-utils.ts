export type TimePeriodType = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface BloodPressureRecord {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  period: TimePeriodType;
  note: string | null;
  measuredAt: string;
  createdAt: string;
}

export interface BPCategory {
  key: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  label: string;
  shortLabel: string;
  description: string;
  textClass: string;
  dotColor: string;
  bgTintClass: string;
}

export function classifyBloodPressure(systolic: number, diastolic: number): BPCategory {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      key: 'crisis',
      label: 'ความดันสูงวิกฤต',
      shortLabel: 'วิกฤต',
      description: 'ควรพบแพทย์โดยด่วน',
      textClass: 'text-red-700',
      dotColor: '#DC2626',
      bgTintClass: 'bg-red-50/70',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      key: 'stage2',
      label: 'ความดันสูง ระยะที่ 2',
      shortLabel: 'สูง ระยะ 2',
      description: 'ควรปรึกษาแพทย์เพื่อวางแผนการรักษา',
      textClass: 'text-red-600',
      dotColor: '#DC2626',
      bgTintClass: 'bg-red-50/50',
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      key: 'stage1',
      label: 'ความดันสูง ระยะที่ 1',
      shortLabel: 'สูง ระยะ 1',
      description: 'ควรปรับพฤติกรรมและติดตามค่าใกล้ชิด',
      textClass: 'text-amber-700',
      dotColor: '#D97706',
      bgTintClass: 'bg-amber-50/60',
    };
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      key: 'elevated',
      label: 'ความดันค่อนข้างสูง',
      shortLabel: 'ค่อนข้างสูง',
      description: 'ควรควบคุมอาหารและออกกำลังกายสม่ำเสมอ',
      textClass: 'text-amber-600',
      dotColor: '#D97706',
      bgTintClass: 'bg-amber-50/40',
    };
  }
  return {
    key: 'normal',
    label: 'ความดันปกติ',
    shortLabel: 'ปกติ',
    description: 'อยู่ในเกณฑ์สุขภาพดี',
    textClass: 'text-emerald-700',
    dotColor: '#16A34A',
    bgTintClass: 'bg-emerald-50/50',
  };
}

export const PERIOD_LABELS: Record<TimePeriodType, string> = {
  MORNING: 'ช่วงเช้า',
  AFTERNOON: 'ช่วงกลางวัน',
  EVENING: 'ช่วงเย็น',
};

export const PERIOD_TIME_HINTS: Record<TimePeriodType, string> = {
  MORNING: '06:00 – 11:59',
  AFTERNOON: '12:00 – 17:59',
  EVENING: '18:00 – 23:59',
};

export function formatThaiDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function formatThaiDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export interface WeeklySummary {
  totalReadings: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
  prevAvgSystolic: number | null;
  prevAvgDiastolic: number | null;
  systolicDelta: number | null;
  diastolicDelta: number | null;
  category: BPCategory | null;
  byPeriod: Record<
    TimePeriodType,
    { count: number; avgSystolic: number; avgDiastolic: number; avgPulse: number } | null
  >;
  statusCounts: {
    normal: number;
    elevated: number;
    stage1: number;
    stage2: number;
    crisis: number;
  };
  summaryText: string;
}

export function computeWeeklySummary(logs: BloodPressureRecord[]): WeeklySummary {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentLogs = logs.filter((l) => new Date(l.measuredAt) >= sevenDaysAgo);
  const prevLogs = logs.filter((l) => {
    const d = new Date(l.measuredAt);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const emptyPeriod = {
    MORNING: null,
    AFTERNOON: null,
    EVENING: null,
  };

  if (recentLogs.length === 0) {
    return {
      totalReadings: 0,
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: 0,
      minSystolic: 0,
      maxSystolic: 0,
      minDiastolic: 0,
      maxDiastolic: 0,
      prevAvgSystolic: null,
      prevAvgDiastolic: null,
      systolicDelta: null,
      diastolicDelta: null,
      category: null,
      byPeriod: emptyPeriod,
      statusCounts: { normal: 0, elevated: 0, stage1: 0, stage2: 0, crisis: 0 },
      summaryText: 'ยังไม่มีข้อมูลการวัดความดันในรอบ 7 วันที่ผ่านมา เริ่มบันทึกค่าแรกของคุณเพื่อดูสรุปผลอัตโนมัติ',
    };
  }

  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const avgSystolic = avg(recentLogs.map((l) => l.systolic));
  const avgDiastolic = avg(recentLogs.map((l) => l.diastolic));
  const avgPulse = avg(recentLogs.map((l) => l.pulse));

  const minSystolic = Math.min(...recentLogs.map((l) => l.systolic));
  const maxSystolic = Math.max(...recentLogs.map((l) => l.systolic));
  const minDiastolic = Math.min(...recentLogs.map((l) => l.diastolic));
  const maxDiastolic = Math.max(...recentLogs.map((l) => l.diastolic));

  const prevAvgSystolic = prevLogs.length > 0 ? avg(prevLogs.map((l) => l.systolic)) : null;
  const prevAvgDiastolic = prevLogs.length > 0 ? avg(prevLogs.map((l) => l.diastolic)) : null;

  const systolicDelta = prevAvgSystolic !== null ? avgSystolic - prevAvgSystolic : null;
  const diastolicDelta = prevAvgDiastolic !== null ? avgDiastolic - prevAvgDiastolic : null;

  const category = classifyBloodPressure(avgSystolic, avgDiastolic);

  const byPeriod: WeeklySummary['byPeriod'] = {
    MORNING: null,
    AFTERNOON: null,
    EVENING: null,
  };

  (['MORNING', 'AFTERNOON', 'EVENING'] as TimePeriodType[]).forEach((period) => {
    const pLogs = recentLogs.filter((l) => l.period === period);
    if (pLogs.length > 0) {
      byPeriod[period] = {
        count: pLogs.length,
        avgSystolic: avg(pLogs.map((l) => l.systolic)),
        avgDiastolic: avg(pLogs.map((l) => l.diastolic)),
        avgPulse: avg(pLogs.map((l) => l.pulse)),
      };
    }
  });

  const statusCounts = { normal: 0, elevated: 0, stage1: 0, stage2: 0, crisis: 0 };
  recentLogs.forEach((l) => {
    const c = classifyBloodPressure(l.systolic, l.diastolic);
    statusCounts[c.key] += 1;
  });

  let trendSentence = '';
  if (systolicDelta !== null) {
    if (systolicDelta <= -3) {
      trendSentence = ` แนวโน้มค่าตัวบนลดลง ${Math.abs(systolicDelta)} mmHg เทียบกับสัปดาห์ก่อน`;
    } else if (systolicDelta >= 3) {
      trendSentence = ` แนวโน้มค่าตัวบนเพิ่มขึ้น ${systolicDelta} mmHg เทียบกับสัปดาห์ก่อน`;
    } else {
      trendSentence = ' แนวโน้มคงที่ใกล้เคียงกับสัปดาห์ก่อน';
    }
  }

  const summaryText = `ค่าเฉลี่ย 7 วันล่าสุดอยู่ที่ ${avgSystolic}/${avgDiastolic} mmHg (ชีพจร ${avgPulse} bpm) จากการวัด ${recentLogs.length} ครั้ง จัดอยู่ในเกณฑ์${category.label}${trendSentence}`;

  return {
    totalReadings: recentLogs.length,
    avgSystolic,
    avgDiastolic,
    avgPulse,
    minSystolic,
    maxSystolic,
    minDiastolic,
    maxDiastolic,
    prevAvgSystolic,
    prevAvgDiastolic,
    systolicDelta,
    diastolicDelta,
    category,
    byPeriod,
    statusCounts,
    summaryText,
  };
}
