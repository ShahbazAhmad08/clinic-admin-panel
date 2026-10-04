'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const WEEKLY_DATA = [
  { day: 'Mon', visits: 24, revenue: 14200 },
  { day: 'Tue', visits: 32, revenue: 18500 },
  { day: 'Wed', visits: 28, revenue: 16100 },
  { day: 'Thu', visits: 38, revenue: 22400 },
  { day: 'Fri', visits: 45, revenue: 27900 },
  { day: 'Sat', visits: 52, revenue: 31200 },
  { day: 'Sun', visits: 18, revenue: 11000 },
];

const GENDER_DATA = [
  { name: 'Male', value: 58, color: '#06b6d4' },
  { name: 'Female', value: 38, color: '#ec4899' },
  { name: 'Child / Other', value: 4, color: '#8b5cf6' },
];

const TOP_DIAGNOSES = [
  { disease: 'Type 2 Diabetes Mellitus', count: 42, percent: '32%' },
  { disease: 'Hypertension (High BP)', count: 35, percent: '26%' },
  { disease: 'Viral Fever / Bronchitis', count: 28, percent: '21%' },
  { disease: 'Acidity & Gastritis', count: 18, percent: '14%' },
  { disease: 'Joint Pain & Arthritis', count: 9, percent: '7%' },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Clinic Intelligence & Footfall Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Reports & Performance Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Analyze daily footfall, revenue growth, demographic breakdown, and top clinical diagnoses.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Weekly Footfall</span>
          <span className="text-2xl font-bold text-white font-mono">237 Patients</span>
          <span className="text-[11px] text-emerald-400 block mt-1">↑ +14% vs last week</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Weekly Revenue</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">₹1,41,300</span>
          <span className="text-[11px] text-emerald-400 block mt-1">↑ +18% collection</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Avg Consultation Time</span>
          <span className="text-2xl font-bold text-cyan-300 font-mono">9.5 Mins</span>
          <span className="text-[11px] text-slate-400 block mt-1">Optimal flow</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Returning Patients</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">64%</span>
          <span className="text-[11px] text-amber-300 block mt-1">High retention rate</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Footfall Trend Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Day-Wise Patient Footfall
            </h3>
            <span className="text-xs text-slate-400 font-mono">Past 7 Days</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="visits" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Collection Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Collection Trend (₹)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Past 7 Days</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demographic & Top Diagnoses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnoses Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" /> Common Diagnoses / Illnesses
          </h3>
          <div className="space-y-3 pt-2">
            {TOP_DIAGNOSES.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{d.disease}</span>
                  <span className="font-mono text-cyan-400">{d.count} patients ({d.percent})</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                    style={{ width: d.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics Pie */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Patient Demographics
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-60">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={GENDER_DATA}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {GENDER_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {GENDER_DATA.map((g) => (
                <div key={g.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-slate-300 font-semibold">{g.name}:</span>
                  <span className="text-slate-400 font-mono">{g.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
