import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import type { BloodPressureRecord } from '@/lib/bp-utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  let userProfile = {
    id: session.user.id,
    name: session.user.name || 'ผู้ใช้งาน',
    email: session.user.email || '',
    age: null as number | null,
    gender: null as string | null,
  };

  let serializedLogs: BloodPressureRecord[] = [];

  try {
    const [dbUser, dbLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          gender: true,
        },
      }),
      prisma.bloodPressureLog.findMany({
        where: { userId: session.user.id },
        orderBy: { measuredAt: 'desc' },
        take: 300,
      }),
    ]);

    if (dbUser) {
      userProfile = dbUser;
    }

    serializedLogs = dbLogs.map((log) => ({
      id: log.id,
      userId: log.userId,
      systolic: log.systolic,
      diastolic: log.diastolic,
      pulse: log.pulse,
      period: log.period,
      note: log.note,
      measuredAt: log.measuredAt.toISOString(),
      createdAt: log.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to load dashboard data from PostgreSQL:', error);
  }

  return <DashboardClient user={userProfile} initialLogs={serializedLogs} />;
}
