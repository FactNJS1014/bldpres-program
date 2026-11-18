import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createBpSchema = z.object({
  systolic: z.number().int().min(50, 'ค่าความดันตัวบนต่ำเกินไป').max(260, 'ค่าความดันตัวบนสูงเกินไป'),
  diastolic: z.number().int().min(30, 'ค่าความดันตัวล่างต่ำเกินไป').max(180, 'ค่าความดันตัวล่างสูงเกินไป'),
  pulse: z.number().int().min(30, 'ชีพจรต่ำเกินไป').max(220, 'ชีพจรสูงเกินไป'),
  period: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
  note: z.string().max(300).optional().nullable(),
  measuredAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period');
    const days = searchParams.get('days');

    const where: {
      userId: string;
      period?: 'MORNING' | 'AFTERNOON' | 'EVENING';
      measuredAt?: { gte: Date };
    } = {
      userId: session.user.id,
    };

    if (period === 'MORNING' || period === 'AFTERNOON' || period === 'EVENING') {
      where.period = period;
    }

    if (days && !Number.isNaN(Number(days)) && Number(days) > 0) {
      const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      where.measuredAt = { gte: since };
    }

    const logs = await prisma.bloodPressureLog.findMany({
      where,
      orderBy: { measuredAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('GET /api/bp error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลประวัติความดันโลหิตได้' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createBpSchema.safeParse({
      systolic: Number(body.systolic),
      diastolic: Number(body.diastolic),
      pulse: Number(body.pulse),
      period: body.period,
      note: body.note?.trim() || null,
      measuredAt: body.measuredAt,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'ข้อมูลที่กรอกไม่ถูกต้อง';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const measuredAtDate = parsed.data.measuredAt
      ? new Date(parsed.data.measuredAt)
      : new Date();

    if (Number.isNaN(measuredAtDate.getTime())) {
      return NextResponse.json({ error: 'รูปแบบวันที่และเวลาไม่ถูกต้อง' }, { status: 400 });
    }

    const log = await prisma.bloodPressureLog.create({
      data: {
        userId: session.user.id,
        systolic: parsed.data.systolic,
        diastolic: parsed.data.diastolic,
        pulse: parsed.data.pulse,
        period: parsed.data.period,
        note: parsed.data.note,
        measuredAt: measuredAtDate,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bp error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกข้อมูลความดันโลหิตได้' },
      { status: 500 }
    );
  }
}
