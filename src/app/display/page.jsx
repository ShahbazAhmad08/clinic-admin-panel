'use client';

import React, { useState, useEffect } from 'react';
import { Clock, HeartPulse, Stethoscope, Tv, Volume2, Users } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function DisplayTVPage() {
  const [visits, setVisits] = useState([]);
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    loadQueue();
    const pollInterval = setInterval(loadQueue, 5000); // Live poll every 5s

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, []);

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/visits?date=today');
      const data = await res.json();
      setVisits(data.visits || []);
    } catch (err) {
      console.error(err);
    }
  };

  const inConsultation = visits.filter((v) => v.status === 'IN_CONSULTATION');
  const waitingList = visits.filter((v) => v.status === 'WAITING');

  return (
    <div className="fixed inset-0 z-50 bg-[#060a12] text-white flex flex-col p-6 overflow-hidden select-none">
      {/* Top TV Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-extrabold">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Arogya<span className="text-cyan-400">Care</span> Multi-Specialty Clinic & OPD
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              Live Token Call & Queue Display • Waiting Lounge TV Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-2xl shadow-xl">
          <Clock className="w-6 h-6 text-cyan-400 animate-pulse" />
          <span className="font-mono text-2xl font-bold text-cyan-300">{time}</span>
        </div>
      </div>

      {/* Main Screen Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-stretch">
        {/* Left Column: Now Consulting (Calling Screen) (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 pointer-events-none">
            <span className="flex h-4 w-4 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-sm tracking-wider uppercase mb-6 animate-pulse">
              <Volume2 className="w-4 h-4" /> Now In Consultation
            </div>

            {inConsultation.length > 0 ? (
              <div className="space-y-6">
                {inConsultation.map((curr) => (
                  <div key={curr.id} className="space-y-4">
                    <div className="flex items-baseline gap-4">
                      <span className="text-7xl md:text-9xl font-black font-mono text-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]">
                        #{curr.tokenNo}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        {curr.patient.name}
                      </h2>
                      <p className="text-lg text-slate-400 font-mono mt-1">
                        UHID: <span className="text-cyan-400 font-bold">{curr.patient.uhid}</span>
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-300">Consulting Doctor</p>
                          <p className="text-lg font-black text-white">{curr.doctor.name}</p>
                        </div>
                      </div>

                      <div className="text-right bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 uppercase font-bold block">Room</span>
                        <span className="text-2xl font-black text-cyan-400 font-mono">
                          {curr.doctor.cabinNo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 space-y-3">
                <Users className="w-16 h-16 mx-auto text-slate-600" />
                <h3 className="text-2xl font-bold text-slate-300">Doctor Cabin is Ready</h3>
                <p className="text-base text-slate-400">
                  Next token will be called shortly. Please keep your OPD card ready.
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>📢 Please proceed to the cabin when your token number is displayed.</span>
            <span className="text-cyan-400 font-bold">Arogya OPD System</span>
          </div>
        </div>

        {/* Right Column: Next in Line Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Next in Line
            </h3>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
              {waitingList.length} Waiting
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {waitingList.map((wait, idx) => (
              <div
                key={wait.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black font-mono text-xl flex items-center justify-center">
                    #{wait.tokenNo}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">{wait.patient.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      UHID: {wait.patient.uhid}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Doctor</span>
                  <span className="text-xs font-bold text-slate-300">
                    {wait.doctor.cabinNo}
                  </span>
                </div>
              </div>
            ))}

            {waitingList.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-500">
                No patients currently waiting in queue.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <strong>OPD Notice:</strong> Sanitized cabins, 24x7 Emergency assistance, In-house Pharmacy & Pathology available.
        </span>
        <span className="font-mono text-slate-500">For enquiries, reach Reception Desk</span>
      </div>
    </div>
  );
}
