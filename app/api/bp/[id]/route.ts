import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
