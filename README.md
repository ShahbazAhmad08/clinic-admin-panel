# ArogyaCare - Modern Clinic & OPD Management System

A full-stack, enterprise-grade Clinic Management and OPD Reception System built with **Next.js 14**, **Prisma ORM**, and **PostgreSQL (Neon.tech)**.

## 🌟 Key Features
- **OPD Queue & Token Display**: Live token status for Reception, Waiting Area TV display, and Doctor's Cabin.
- **Patient Management**: UHID generation, patient records, vital stats, medical histories, and allergies.
- **Doctor Consultation Desk**: Digital Rx and photo prescription upload, diagnosis tracking, and follow-ups.
- **Billing & Invoices**: OPD fee calculation, payment modes (Cash, UPI, Card), and printable receipts.
- **Lab & Pathology Reports**: Upload and track laboratory test records.
- **Analytics & Revenue**: Daily footfall, collection summaries, and OPD trends.

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Styling**: Tailwind CSS & Lucide Icons
- **Deployment**: Vercel

## 🚀 Quick Start Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShahbazAhmad08/clinic-admin-panel.git
   cd clinic-admin-panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file:
   ```env
   DATABASE_URL="your-postgresql-database-url"
   NEXT_PUBLIC_APP_NAME="ArogyaCare Clinic Desk"
   NEXT_PUBLIC_CLINIC_NAME="Arogya Multi-Specialty Clinic & OPD"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
