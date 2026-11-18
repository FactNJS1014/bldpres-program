import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateBpSchema = z.object({
  systolic: z.number().int().min(50, 'ค่าความดันตัวบนต่ำเกินไป').max(260, 'ค่าความดันตัวบนสูงเกินไป'),
  diastolic: z.number().int().min(30, 'ค่าความดันตัวล่างต่ำเกินไป').max(180, 'ค่าความดันตัวล่างสูงเกินไป'),
  pulse: z.number().int().min(30, 'ชีพจรต่ำเกินไป').max(220, 'ชีพจรสูงเกินไป'),
  period: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
  note: z.string().max(300).optional().nullable(),
  measuredAt: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.bloodPressureLog.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบรายการที่ต้องการแก้ไข' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateBpSchema.safeParse({
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
      : existing.measuredAt;

    if (Number.isNaN(measuredAtDate.getTime())) {
      return NextResponse.json({ error: 'รูปแบบวันที่และเวลาไม่ถูกต้อง' }, { status: 400 });
    }

    const log = await prisma.bloodPressureLog.update({
      where: { id },
      data: {
        systolic: parsed.data.systolic,
        diastolic: parsed.data.diastolic,
        pulse: parsed.data.pulse,
        period: parsed.data.period,
        note: parsed.data.note,
        measuredAt: measuredAtDate,
      },
    });

    return NextResponse.json({ log });
  } catch (error) {
    console.error('PATCH /api/bp/[id] error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถแก้ไขข้อมูลความดันโลหิตได้' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.bloodPressureLog.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบรายการที่ต้องการลบ' }, { status: 404 });
    }

    await prisma.bloodPressureLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bp/[id] error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถลบรายการได้' },
      { status: 500 }
    );
  }
}
