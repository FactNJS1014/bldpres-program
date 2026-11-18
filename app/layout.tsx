import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Sans_Thai, JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PulseLog — ระบบบันทึกและติดตามความดันโลหิต',
  description:
    'เว็บแอปพลิเคชันบันทึกความดันโลหิตรายวัน ช่วงเช้า กลางวัน เย็น พร้อมกราฟแนวโน้ม สรุปผลรายสัปดาห์อัตโนมัติ และส่งออกไฟล์ PDF เพื่อปรึกษาแพทย์',
  openGraph: {
    title: 'PulseLog — ระบบบันทึกและติดตามความดันโลหิต',
    description:
      'เว็บแอปพลิเคชันบันทึกความดันโลหิตรายวัน ช่วงเช้า กลางวัน เย็น พร้อมกราฟแนวโน้ม สรุปผลรายสัปดาห์อัตโนมัติ และส่งออกไฟล์ PDF เพื่อปรึกษาแพทย์',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseLog — ระบบบันทึกและติดตามความดันโลหิต',
    description:
      'เว็บแอปพลิเคชันบันทึกความดันโลหิตรายวัน ช่วงเช้า กลางวัน เย็น พร้อมกราฟแนวโน้ม สรุปผลรายสัปดาห์อัตโนมัติ และส่งออกไฟล์ PDF เพื่อปรึกษาแพทย์',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${plusJakarta.variable} ${ibmPlexThai.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
