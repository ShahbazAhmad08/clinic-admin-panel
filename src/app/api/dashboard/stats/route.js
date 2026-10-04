import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      todayVisits,
      waitingVisits,
      inConsultationVisits,
      completedVisits,
      todayInvoices,
      recentVisits,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.visit.count({
        where: { visitDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.visit.count({
        where: {
          visitDate: { gte: todayStart, lte: todayEnd },
          status: 'WAITING',
        },
      }),
      prisma.visit.count({
        where: {
          visitDate: { gte: todayStart, lte: todayEnd },
          status: 'IN_CONSULTATION',
        },
      }),
      prisma.visit.count({
        where: {
          visitDate: { gte: todayStart, lte: todayEnd },
          status: 'COMPLETED',
        },
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.visit.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: true,
          doctor: true,
          prescriptions: true,
          vitals: true,
        },
      }),
    ]);

    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    return NextResponse.json({
      totalPatients,
      todayVisits,
      waitingVisits,
      inConsultationVisits,
      completedVisits,
      todayRevenue,
      recentVisits,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
