import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata = {
  title: 'ArogyaCare - Doctor Clinic & OPD Admin Desk',
  description: 'Comprehensive Clinic Admin Panel for Doctor Assistant, OPD Queue, Vitals, Prescription Management & Billing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 flex min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
