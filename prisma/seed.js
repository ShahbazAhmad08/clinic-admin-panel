const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding clinic SQL database with realistic patients, doctors, OPD queues, and prescriptions...');

  // Clear existing
  await prisma.prescription.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.staff.deleteMany();

  // Create Doctors
  const drRajesh = await prisma.doctor.create({
    data: {
      name: 'Dr. Rajesh Sharma',
      specialization: 'Senior Consultant Physician & Diabetologist',
      qualification: 'MBBS, MD (General Medicine)',
      phone: '+91 98765 43210',
      email: 'dr.rajesh@arogyacare.com',
      cabinNo: 'Cabin 1',
      consultationFee: 500,
    },
  });

  const drPriya = await prisma.doctor.create({
    data: {
      name: 'Dr. Priya Patel',
      specialization: 'Cardiologist & General Medicine',
      qualification: 'MBBS, MD, DM (Cardiology)',
      phone: '+91 98765 12345',
      email: 'dr.priya@arogyacare.com',
      cabinNo: 'Cabin 2',
      consultationFee: 700,
    },
  });

  // Create Staff
  await prisma.staff.createMany({
    data: [
      { name: 'Amit Kumar', role: 'RECEPTIONIST', phone: '+91 98112 33445', email: 'reception@arogyacare.com' },
      { name: 'Sunita Roy', role: 'ASSISTANT', phone: '+91 98223 44556', email: 'sunita@arogyacare.com' },
    ],
  });

  // Sample handwritten prescription photo placeholder (base64 SVG data URI representing a doctor prescription slip)
  const sampleRxPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23fff"><rect width="100%" height="100%" fill="%23fdfbf7"/><rect x="20" y="20" width="560" height="760" rx="8" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="40" y="60" font-family="sans-serif" font-size="22" font-weight="bold" fill="%230891b2">AROGYA CLINIC &amp; OPD</text><text x="40" y="85" font-family="sans-serif" font-size="12" fill="%2364748b">Dr. Rajesh Sharma (MBBS, MD) • Reg No: 84920/MCI</text><line x1="40" y1="100" x2="560" y2="100" stroke="%230891b2" stroke-width="2"/><text x="40" y="130" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e293b">Patient: Ramesh Verma (48y/M)</text><text x="380" y="130" font-family="sans-serif" font-size="13" fill="%2364748b">Date: 03 Oct 2026</text><text x="40" y="155" font-family="sans-serif" font-size="12" fill="%23e11d48">Allergies: Penicillin, Dust</text><line x1="40" y1="170" x2="560" y2="170" stroke="%23e2e8f0" stroke-width="1"/><text x="40" y="220" font-family="serif" font-size="32" font-style="italic" font-weight="bold" fill="%231e293b">&#8478;</text><text x="75" y="250" font-family="cursive" font-size="17" fill="%230f172a">1. Tab Metformin 500mg &#8212; 1-0-1 (After Meals) x 30 days</text><text x="75" y="290" font-family="cursive" font-size="17" fill="%230f172a">2. Tab Telmisartan 40mg &#8212; 1-0-0 (Morning) x 30 days</text><text x="75" y="330" font-family="cursive" font-size="17" fill="%230f172a">3. Cap Pantocid 40 &#8212; 1-0-0 (Empty Stomach) x 15 days</text><text x="40" y="420" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23334155">Advice / Follow-up:</text><text x="40" y="450" font-family="sans-serif" font-size="13" fill="%23475569">&#8226; Low salt, low carbohydrate diabetic diet</text><text x="40" y="475" font-family="sans-serif" font-size="13" fill="%23475569">&#8226; Daily 30 min morning walk</text><text x="40" y="500" font-family="sans-serif" font-size="13" fill="%23475569">&#8226; Recheck Fasting &amp; PP Sugar in 15 days</text><line x1="380" y1="700" x2="540" y2="700" stroke="%23334155" stroke-width="1"/><text x="400" y="725" font-family="cursive" font-size="18" fill="%230891b2">Dr. Rajesh Sharma</text><text x="410" y="745" font-family="sans-serif" font-size="11" fill="%2364748b">Signature / Stamp</text></svg>`;

  // Create Patients
  const p1 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0001',
      name: 'Ramesh Chandra Verma',
      phone: '9876543210',
      email: 'ramesh.verma@example.com',
      age: 48,
      gender: 'Male',
      bloodGroup: 'B+',
      address: 'Flat 402, Shanti Heights, Kanpur',
      emergencyContact: 'Son: Rohit Verma (9876500112)',
      allergies: 'Penicillin, Dust allergy',
      chronicDiseases: 'Type 2 Diabetes, Hypertension',
      medicalHistory: 'Diabetic since 2018. Under regular checkup.',
    },
  });

  const p2 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0002',
      name: 'Ananya Sharma',
      phone: '9811223344',
      email: 'ananya.sharma@example.com',
      age: 29,
      gender: 'Female',
      bloodGroup: 'O+',
      address: '12/A, Civil Lines, Lucknow',
      emergencyContact: 'Mother: Sunita (9811223355)',
      allergies: 'Sulfa drugs',
      chronicDiseases: 'Hypothyroidism',
      medicalHistory: 'Thyroid diagnosed in 2021. Taking Thyronorm 50mcg.',
    },
  });

  const p3 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0003',
      name: 'Mohammad Tariq',
      phone: '9988776655',
      age: 35,
      gender: 'Male',
      bloodGroup: 'A+',
      address: '45, GT Road, Allahabad',
      emergencyContact: 'Wife: Fatima (9988776644)',
      allergies: 'None',
      chronicDiseases: 'None',
      medicalHistory: 'No major surgical history.',
    },
  });

  const p4 = await prisma.patient.create({
    data: {
      uhid: 'PAT-2026-0004',
      name: 'Kavita Mishra',
      phone: '9765432109',
      age: 62,
      gender: 'Female',
      bloodGroup: 'AB+',
      address: '88/4, Indiranagar, Lucknow',
      emergencyContact: 'Husband: S.K. Mishra (9765432100)',
      allergies: 'Aspirin',
      chronicDiseases: 'Hypertension, Osteoarthritis',
      medicalHistory: 'Knee pain past 3 years.',
    },
  });

  // Create Past & Today's Visits for P1
  const v1Past = await prisma.visit.create({
    data: {
      tokenNo: 4,
      patientId: p1.id,
      doctorId: drRajesh.id,
      visitDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      visitType: 'NEW_VISIT',
      status: 'COMPLETED',
      chiefComplaints: 'High blood sugar, fatigue, frequent urination at night',
      diagnosis: 'Type 2 Diabetes Mellitus - Uncontrolled & Stage 1 HTN',
      doctorNotes: 'Advised strict diet and regular glucose monitoring.',
      nextFollowUpDate: new Date(),
    },
  });

  await prisma.vital.create({
    data: {
      visitId: v1Past.id,
      bpSystolic: 145,
      bpDiastolic: 92,
      pulseRate: 82,
      weight: 78.5,
      temperature: 98.4,
      spo2: 98,
      bloodSugar: 210,
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: v1Past.id,
      prescriptionType: 'PHOTO_UPLOAD',
      photoUrl: sampleRxPhotoSvg,
      digitalRxJson: JSON.stringify([
        { name: 'Tab Metformin 500mg', dosage: '1-0-1', timing: 'After Meals', duration: '30 days' },
        { name: 'Tab Telmisartan 40mg', dosage: '1-0-0', timing: 'Morning', duration: '30 days' },
        { name: 'Cap Pantocid 40', dosage: '1-0-0', timing: 'Empty Stomach', duration: '15 days' },
      ]),
      instructions: 'Low salt, diabetic diet. Morning walk 30 mins daily.',
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-0001',
      patientId: p1.id,
      visitId: v1Past.id,
      consultationFee: 500,
      procedureFee: 100,
      medicineFee: 0,
      discount: 0,
      totalAmount: 600,
      paidAmount: 600,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
    },
  });

  // Today's Queue Visits
  // Token 1: With Doctor (P1 today)
  const v1Today = await prisma.visit.create({
    data: {
      tokenNo: 1,
      patientId: p1.id,
      doctorId: drRajesh.id,
      visitDate: new Date(),
      visitType: 'FOLLOW_UP',
      status: 'IN_CONSULTATION',
      chiefComplaints: 'Follow-up for diabetes & BP review',
      diagnosis: 'Type 2 DM - Improving with medication',
      doctorNotes: 'Fasting sugar improved to 135 mg/dL. Continue same dosage.',
      nextFollowUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.vital.create({
    data: {
      visitId: v1Today.id,
      bpSystolic: 128,
      bpDiastolic: 84,
      pulseRate: 74,
      weight: 77.0,
      temperature: 98.6,
      spo2: 99,
      bloodSugar: 135,
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: v1Today.id,
      prescriptionType: 'PHOTO_UPLOAD',
      photoUrl: sampleRxPhotoSvg,
      digitalRxJson: JSON.stringify([
        { name: 'Tab Metformin 500mg', dosage: '1-0-1', timing: 'After Meals', duration: '30 days' },
        { name: 'Tab Telmisartan 40mg', dosage: '1-0-0', timing: 'Morning', duration: '30 days' },
      ]),
      instructions: 'Continue regular exercise. Routine HbA1c test next month.',
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-0002',
      patientId: p1.id,
      visitId: v1Today.id,
      consultationFee: 300,
      procedureFee: 0,
      medicineFee: 0,
      discount: 0,
      totalAmount: 300,
      paidAmount: 300,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
    },
  });

  // Token 2: Waiting (P2)
  const v2Today = await prisma.visit.create({
    data: {
      tokenNo: 2,
      patientId: p2.id,
      doctorId: drRajesh.id,
      visitDate: new Date(),
      visitType: 'NEW_VISIT',
      status: 'WAITING',
      chiefComplaints: 'Severe dry cough, throat irritation, mild fever for 2 days',
    },
  });

  await prisma.vital.create({
    data: {
      visitId: v2Today.id,
      bpSystolic: 118,
      bpDiastolic: 78,
      pulseRate: 80,
      weight: 56.0,
      temperature: 100.2,
      spo2: 98,
    },
  });

  // Token 3: Waiting (P3)
  const v3Today = await prisma.visit.create({
    data: {
      tokenNo: 3,
      patientId: p3.id,
      doctorId: drPriya.id,
      visitDate: new Date(),
      visitType: 'NEW_VISIT',
      status: 'WAITING',
      chiefComplaints: 'Chest discomfort on exertion, breathlessness',
    },
  });

  await prisma.vital.create({
    data: {
      visitId: v3Today.id,
      bpSystolic: 138,
      bpDiastolic: 88,
      pulseRate: 88,
      weight: 72.0,
      temperature: 98.6,
      spo2: 97,
    },
  });

  // Token 4: Waiting (P4)
  const v4Today = await prisma.visit.create({
    data: {
      tokenNo: 4,
      patientId: p4.id,
      doctorId: drRajesh.id,
      visitDate: new Date(),
      visitType: 'FOLLOW_UP',
      status: 'WAITING',
      chiefComplaints: 'Bilateral knee pain, morning stiffness',
    },
  });

  // Add Lab Report for P1
  await prisma.labReport.create({
    data: {
      patientId: p1.id,
      visitId: v1Past.id,
      testName: 'Complete Blood Count (CBC) & HbA1c',
      testCategory: 'PATHOLOGY',
      reportFileUrl: sampleRxPhotoSvg,
      fileType: 'IMAGE',
      labName: 'Arogya Pathology Lab',
      notes: 'HbA1c: 7.8% (Borderline elevated), TLC: 7,200',
    },
  });

  console.log('✅ Database seeded successfully with 4 patients, 5 visits, vitals, invoices, prescriptions, and doctors!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
