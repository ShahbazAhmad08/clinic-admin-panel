import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          include: {
            patient: true,
            doctor: true,
            prescriptions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      visitId,
      prescriptionType,
      photoUrl,
      digitalRxJson,
      instructions,
      diagnosis,
      doctorNotes,
      nextFollowUpDate,
    } = body;

    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 });
    }

    // Save or update prescription
    const prescription = await prisma.prescription.create({
      data: {
        visitId,
        prescriptionType: prescriptionType || 'PHOTO_UPLOAD',
        photoUrl: photoUrl || null,
        digitalRxJson: digitalRxJson || null,
        instructions: instructions || '',
      },
    });

    // Update the visit diagnosis, notes, follow-up, and status to COMPLETED
    const visitUpdateData = {
      status: 'COMPLETED',
    };
    if (diagnosis) visitUpdateData.diagnosis = diagnosis;
    if (doctorNotes) visitUpdateData.doctorNotes = doctorNotes;
    if (nextFollowUpDate) {
      visitUpdateData.nextFollowUpDate = new Date(nextFollowUpDate);
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: visitUpdateData,
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json(
      {
        prescription,
        visit: updatedVisit,
        message: 'Prescription saved & Consultation completed successfully!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving prescription:', error);
    return NextResponse.json({ error: error.message || 'Failed to save prescription' }, { status: 500 });
  }
}
