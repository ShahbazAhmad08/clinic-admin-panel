import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const labReports = await prisma.labReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        visit: {
          include: {
            doctor: true,
          },
        },
      },
    });

    return NextResponse.json({ labReports });
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    return NextResponse.json({ error: 'Failed to fetch lab reports' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, visitId, testName, testCategory, reportFileUrl, fileType, labName, notes } = body;

    if (!patientId || !testName || !reportFileUrl) {
      return NextResponse.json(
        { error: 'Patient ID, Test Name, and Report File are required' },
        { status: 400 }
      );
    }

    const labReport = await prisma.labReport.create({
      data: {
        patientId,
        visitId: visitId || null,
        testName,
        testCategory: testCategory || 'PATHOLOGY',
        reportFileUrl,
        fileType: fileType || 'IMAGE',
        labName: labName || 'In-House Lab',
        notes: notes || '',
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({ labReport, message: 'Lab report uploaded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error uploading lab report:', error);
    return NextResponse.json({ error: 'Failed to upload lab report' }, { status: 500 });
  }
}
