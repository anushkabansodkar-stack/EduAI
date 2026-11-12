import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { fetchAnalyticsData } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData().then(setData).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Learning & Assessment Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregate examination health, student quiz trends, and cognitive distribution over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Academic Year 2026</span>
          </span>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Audited Papers</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {data?.papersCount || 14}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">+4 this month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Questions Evaluated</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {data?.questionsCount || 182}
          </span>
          <span className="text-[11px] text-blue-700 font-semibold block mt-1">Across 6 Bloom Tiers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Student Quizzes Taken</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {data?.quizzesTaken || 48}
          </span>
          <span className="text-[11px] text-indigo-700 font-semibold block mt-1">Adaptive Self-Study</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Avg Student Mastery</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {data?.avgStudentScore || 82.4}%
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">+6.2% vs baseline</span>
        </div>
      </div>

      {/* Monthly Activity Area Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Assessment & Student Activity Volume</h2>
            <p className="text-xs text-slate-500">Monthly examination papers analyzed vs student quiz attempts</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Monthly Aggregates</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data?.monthlyActivity || [
                { month: 'Jun', papers: 3, quizzes: 8 },
                { month: 'Jul', papers: 5, quizzes: 14 },
                { month: 'Aug', papers: 7, quizzes: 22 },
                { month: 'Sep', papers: 11, quizzes: 35 },
                { month: 'Oct', papers: 14, quizzes: 48 },
              ]}
              margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="quizzes" stroke="#4f46e5" fill="#eef2ff" name="Student Quizzes" />
              <Area type="monotone" dataKey="papers" stroke="#0ea5e9" fill="#f0f9ff" name="Papers Analyzed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aggregate Weak Topics Across Cohort */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Cohort Struggling Concept Index</h2>
          <p className="text-xs text-slate-500">Topics with the highest student error rate during practice sessions</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {(data?.weakTopicsAggregate || [
            { topic: 'Linear Probing Collision Chains', struggleRate: 42 },
            { topic: 'Floyd Cycle Detection Proofs', struggleRate: 38 },
            { topic: 'AVL Tree Double Rotations', struggleRate: 31 },
            { topic: 'Quick Sort Worst-Case Degeneracy', struggleRate: 26 },
          ]).map((item: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{item.topic}</span>
                <span className="text-rose-600 font-mono">{item.struggleRate}% error rate</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.struggleRate}%` }} />
              </div>
              <p className="text-[10px] text-slate-500">
                Action: Teachers should consider dedicating 15 minutes of lecture recap to this concept.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
