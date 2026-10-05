const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Dr. Amitabh Upadhyay - Skin & HIV Care Clinic...');

  // Clear existing data
  await prisma.prescription.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.staff.deleteMany();

  // Create Primary Doctor: Dr. Amitabh Upadhyay
  const drAmitabh = await prisma.doctor.create({
    data: {
      name: 'Dr. Amitabh Upadhyay',
      specialization: 'Senior Consultant Dermatology, V.D., Leprosy & AIDS',
      qualification: 'M.B.B.S., FHM (MAMC, Delhi), MIAS (Geneva, Switzerland)',
      phone: '+91 9555960720, 9935140534',
      email: 'amitabhsu@rediffmail.com',
      cabinNo: 'Main Cabin',
      consultationFee: 500,
    },
  });

  // Create Staff
  await prisma.staff.createMany({
    data: [
      { name: 'Clinic Receptionist', role: 'RECEPTIONIST', phone: '+91 9555960720', email: 'reception@skinandhivcare.com' },
      { name: 'Clinic Assistant', role: 'ASSISTANT', phone: '+91 9935140534', email: 'assistant@skinandhivcare.com' },
    ],
  });

  // Create Sample Patients
  const p1 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0001',
      name: 'Anishta',
      phone: '9876543210',
      email: 'anishta@example.com',
      age: 52,
      gender: 'Male',
      bloodGroup: 'B+',
      address: 'Civil Lines, Prayagraj',
      emergencyContact: 'Family: 9876500112',
      allergies: 'Sulfa drugs',
      chronicDiseases: 'Skin Dermatitis & Hypertension',
      medicalHistory: 'Chronic eczema under routine follow-up.',
    },
  });

  const p2 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0002',
      name: 'Rajesh Verma',
      phone: '9811223344',
      email: 'rajesh.verma@example.com',
      age: 44,
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'Jhunsi, Prayagraj',
      emergencyContact: 'Brother: 9811223355',
      allergies: 'Penicillin',
      chronicDiseases: 'Psoriasis',
      medicalHistory: 'Skin lesions on extensor surfaces.',
    },
  });

  const p3 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0003',
      name: 'Sunita Devi',
      phone: '9988776655',
      age: 38,
      gender: 'Female',
      bloodGroup: 'A+',
      address: 'Naini, Prayagraj',
      emergencyContact: 'Husband: 9988776644',
      allergies: 'None',
      chronicDiseases: 'Allergic Contact Dermatitis',
      medicalHistory: 'Recurrent itching on hands and forearms.',
    },
  });

  const p4 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0004',
      name: 'Vikas Pandey',
      phone: '9765432109',
      age: 31,
      gender: 'Male',
      bloodGroup: 'AB+',
      address: 'Katra, Prayagraj',
      emergencyContact: 'Father: 9765432100',
      allergies: 'None',
      chronicDiseases: 'Fungal Infection (Tinea Corporis)',
      medicalHistory: 'Treated for fungal rash 6 months ago.',
    },
  });

  // Create Today's Visits
  // Token 1: In Consultation (Anishta)
  const v1 = await prisma.visit.create({
    data: {
      tokenNo: 1,
      patientId: p1.id,
      doctorId: drAmitabh.id,
      visitDate: new Date(),
      visitType: 'FOLLOW_UP',
      status: 'IN_CONSULTATION',
      chiefComplaints: 'Follow-up for eczema & skin rashes',
      diagnosis: 'Chronic Atopic Dermatitis with Xerosis',
      doctorNotes: 'Apply topical emollient twice daily. Avoid harsh soaps.',
      nextFollowUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.vital.create({
    data: {
      visitId: v1.id,
      bpSystolic: 124,
      bpDiastolic: 82,
      pulseRate: 76,
      weight: 68.0,
      temperature: 98.6,
      spo2: 99,
      bloodSugar: 110,
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: v1.id,
      prescriptionType: 'DIGITAL',
      digitalRxJson: JSON.stringify([
        { name: 'Tab Levocetirizine 5mg', dosage: '0-0-1', timing: 'Bedtime', duration: '15 days', notes: 'For itching' },
        { name: 'Mometasone Furoate 0.1% Cream', dosage: '1-0-1', timing: 'Apply thin layer', duration: '10 days', notes: 'Affected area only' },
        { name: 'Liquid Paraffin + White Soft Paraffin Lotion', dosage: '1-1-1', timing: 'After bath & as needed', duration: '30 days', notes: 'Moisturizer' },
      ]),
      instructions: 'Use lukewarm water for bathing. Avoid synthetic clothes. Review after 15 days.',
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-0001',
      patientId: p1.id,
      visitId: v1.id,
      consultationFee: 500,
      procedureFee: 0,
      medicineFee: 0,
      discount: 0,
      totalAmount: 500,
      paidAmount: 500,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
    },
  });

  // Token 2: Waiting (Rajesh Verma)
  const v2 = await prisma.visit.create({
    data: {
      tokenNo: 2,
      patientId: p2.id,
      doctorId: drAmitabh.id,
      visitDate: new Date(),
      visitType: 'NEW_VISIT',
      status: 'WAITING',
      chiefComplaints: 'Scaly plaques on elbows and scalp with mild pruritus',
    },
  });

  await prisma.vital.create({
    data: {
      visitId: v2.id,
      bpSystolic: 120,
      bpDiastolic: 80,
      pulseRate: 72,
      weight: 74.0,
      temperature: 98.4,
      spo2: 98,
    },
  });

  // Token 3: Waiting (Sunita Devi)
  const v3 = await prisma.visit.create({
    data: {
      tokenNo: 3,
      patientId: p3.id,
      doctorId: drAmitabh.id,
      visitDate: new Date(),
      visitType: 'NEW_VISIT',
      status: 'WAITING',
      chiefComplaints: 'Severe burning and redness on facial skin after cosmetic use',
    },
  });

  // Token 4: Waiting (Vikas Pandey)
  const v4 = await prisma.visit.create({
    data: {
      tokenNo: 4,
      patientId: p4.id,
      doctorId: drAmitabh.id,
      visitDate: new Date(),
      visitType: 'NEW_VISIT',
      status: 'WAITING',
      chiefComplaints: 'Ring-shaped itchy patches on groin and torso for 3 weeks',
    },
  });

  // Lab Report for P1
  await prisma.labReport.create({
    data: {
      patientId: p1.id,
      visitId: v1.id,
      testName: 'Complete Blood Count (CBC) & Absolute Eosinophil Count (AEC)',
      testCategory: 'PATHOLOGY',
      reportFileUrl: '',
      fileType: 'IMAGE',
      labName: 'Skin & HIV Care In-House Diagnostic Lab',
      notes: 'AEC: 480 cells/mcL (Mild eosinophilia noted)',
    },
  });

  console.log('✅ Database seeded successfully for Skin & HIV Care Clinic - Dr. Amitabh Upadhyay!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
