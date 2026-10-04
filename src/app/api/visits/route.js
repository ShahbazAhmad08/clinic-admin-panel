import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date'); // 'today' or null
    const statusFilter = searchParams.get('status');

    let where = {};
    if (dateFilter === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      where.visitDate = {
        gte: todayStart,
        lte: todayEnd,
      };
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    const visits = await prisma.visit.findMany({
      where,
      orderBy: [{ status: 'asc' }, { tokenNo: 'asc' }],
      include: {
        patient: true,
        doctor: true,
        vitals: { orderBy: { recordedAt: 'desc' } },
        prescriptions: { orderBy: { createdAt: 'desc' } },
        invoices: true,
      },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, doctorId, visitType, chiefComplaints } = body;

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Patient ID and Doctor ID are required' },
        { status: 400 }
      );
    }

    // Calculate today's next token number
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayVisitsCount = await prisma.visit.count({
      where: {
        visitDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const tokenNo = todayVisitsCount + 1;

    const visit = await prisma.visit.create({
      data: {
        tokenNo,
        patientId,
        doctorId,
        visitType: visitType || 'NEW_VISIT',
        status: 'WAITING',
        chiefComplaints: chiefComplaints || '',
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json({ visit, message: `Token #${tokenNo} generated successfully!` }, { status: 201 });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json({ error: error.message || 'Failed to create visit' }, { status: 500 });
  }
}
