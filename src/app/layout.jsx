import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';

export const metadata = {
  title: 'ArogyaCare - Doctor Clinic & OPD Admin Desk',
  description: 'Comprehensive Clinic Admin Panel for Doctor Assistant, OPD Queue, Vitals, Prescription Management & Billing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
