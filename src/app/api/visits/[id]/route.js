import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        vitals: { orderBy: { recordedAt: 'desc' } },
        prescriptions: { orderBy: { createdAt: 'desc' } },
        invoices: true,
        labReports: true,
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    return NextResponse.json({ visit });
  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json({ error: 'Failed to fetch visit' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const data = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.diagnosis !== undefined) data.diagnosis = body.diagnosis;
    if (body.doctorNotes !== undefined) data.doctorNotes = body.doctorNotes;
    if (body.chiefComplaints !== undefined) data.chiefComplaints = body.chiefComplaints;
    if (body.nextFollowUpDate !== undefined) {
      data.nextFollowUpDate = body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null;
    }

    const visit = await prisma.visit.update({
      where: { id },
      data,
      include: {
        patient: true,
        doctor: true,
        vitals: true,
        prescriptions: true,
      },
    });

    return NextResponse.json({ visit, message: 'Visit updated successfully' });
  } catch (error) {
    console.error('Error updating visit:', error);
    return NextResponse.json({ error: 'Failed to update visit' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.visit.delete({ where: { id } });
    return NextResponse.json({ message: 'Visit removed successfully' });
  } catch (error) {
    console.error('Error deleting visit:', error);
    return NextResponse.json({ error: 'Failed to delete visit' }, { status: 500 });
  }
}
