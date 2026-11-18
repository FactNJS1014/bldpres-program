import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร').max(80),
  email: z.string().trim().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร').max(100),
  age: z.number().int().min(1).max(130).optional().nullable(),
  gender: z.string().max(30).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse({
      ...body,
      age: body.age ? Number(body.age) : null,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        password: hashedPassword,
        age: parsed.data.age ?? null,
        gender: parsed.data.gender ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถลงทะเบียนได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
