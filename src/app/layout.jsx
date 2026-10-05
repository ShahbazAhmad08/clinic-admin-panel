import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';

export const metadata = {
  title: 'Skin & HIV Care Clinic - Dr. Amitabh Upadhyay',
  description: 'Digital Clinic Management, Live Waiting Lounge TV Queue, 1-Click Prescription Slip (OPD Parcha) Printing, Electronic Health Records & Lab Reports.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080d1a] text-slate-100 min-h-screen font-sans selection:bg-blue-500/30 selection:text-blue-200">
        <AuthProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
