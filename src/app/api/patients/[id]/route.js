import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          include: {
            doctor: true,
            vitals: { orderBy: { recordedAt: 'desc' } },
            prescriptions: { orderBy: { createdAt: 'desc' } },
            invoices: true,
          },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        labReports: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ error: 'Failed to fetch patient profile' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        age: Number(body.age),
        gender: body.gender,
        bloodGroup: body.bloodGroup,
        address: body.address,
        emergencyContact: body.emergencyContact,
        allergies: body.allergies,
        chronicDiseases: body.chronicDiseases,
        medicalHistory: body.medicalHistory,
      },
    });

    return NextResponse.json({ patient, message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
