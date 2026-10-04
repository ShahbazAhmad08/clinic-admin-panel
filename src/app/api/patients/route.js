import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { uhid: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
      medicalHistory,
    } = body;

    if (!name || !phone || !age) {
      return NextResponse.json(
        { error: 'Name, Phone, and Age are mandatory fields.' },
        { status: 400 }
      );
    }

    // Auto-generate UHID: PAT-2026-XXXX
    const count = await prisma.patient.count();
    const uhid = `PAT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        uhid,
        name,
        phone,
        email: email || null,
        age: Number(age),
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'O+',
        address: address || '',
        emergencyContact: emergencyContact || '',
        allergies: allergies || '',
        chronicDiseases: chronicDiseases || '',
        medicalHistory: medicalHistory || '',
      },
    });

    return NextResponse.json({ patient, message: 'Patient registered successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: error.message || 'Failed to create patient' }, { status: 500 });
  }
}
