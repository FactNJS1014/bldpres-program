import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  age: z.number().int().min(1).max(130).nullable().optional(),
  gender: z.string().max(30).nullable().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse({
      name: body.name,
      age: body.age === '' || body.age === null || body.age === undefined ? null : Number(body.age),
      gender: body.gender || null,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}
