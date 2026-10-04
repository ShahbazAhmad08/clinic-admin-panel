import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const invoices = await prisma.invoice.findMany({
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

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patientId,
      visitId,
      consultationFee,
      procedureFee,
      medicineFee,
      discount,
      totalAmount,
      paidAmount,
      paymentMethod,
      paymentStatus,
      notes,
    } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        patientId,
        visitId: visitId || null,
        consultationFee: Number(consultationFee || 0),
        procedureFee: Number(procedureFee || 0),
        medicineFee: Number(medicineFee || 0),
        discount: Number(discount || 0),
        totalAmount: Number(totalAmount || 0),
        paidAmount: Number(paidAmount || 0),
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: paymentStatus || 'PAID',
        notes: notes || '',
      },
      include: {
        patient: true,
        visit: true,
      },
    });

    return NextResponse.json({ invoice, message: 'Invoice generated successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
