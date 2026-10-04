import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      visitId,
      bpSystolic,
      bpDiastolic,
      pulseRate,
      weight,
      temperature,
      spo2,
      bloodSugar,
    } = body;

    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 });
    }

    const vital = await prisma.vital.create({
      data: {
        visitId,
        bpSystolic: bpSystolic ? parseInt(bpSystolic) : null,
        bpDiastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
        pulseRate: pulseRate ? parseInt(pulseRate) : null,
        weight: weight ? parseFloat(weight) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        spo2: spo2 ? parseInt(spo2) : null,
        bloodSugar: bloodSugar ? parseFloat(bloodSugar) : null,
      },
    });

    return NextResponse.json({ vital, message: 'Vitals recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving vitals:', error);
    return NextResponse.json({ error: 'Failed to record vitals' }, { status: 500 });
  }
}
