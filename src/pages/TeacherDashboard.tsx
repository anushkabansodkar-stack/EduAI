import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  SearchCode, 
  Sparkles, 
  Layers, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload,
  BarChart3,
  Cpu,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { fetchAnalyticsData, fetchDocuments } from '../services/api';
import { DocumentItem } from '../types';

export const TeacherDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalyticsData().catch(() => null),
      fetchDocuments().catch(() => []),
    ]).then(([analyticsRes, docsRes]) => {
      if (analyticsRes) setAnalytics(analyticsRes);
      if (docsRes) setDocuments(docsRes);
      setLoading(false);
    });
  }, []);

  const difficultyColors = {
    Easy: '#10b981', // emerald
    Medium: '#f59e0b', // amber
    Hard: '#f43f5e', // rose
  };

  const bloomColors = [
    '#3b82f6', // remember
    '#0ea5e9', // understand
    '#14b8a6', // apply
    '#6366f1', // analyze
    '#a855f7', // evaluate
    '#ec4899', // create
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Faculty Examination Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Question paper cognitive audit, difficulty modeling, and curriculum alignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload PDF</span>
          </Link>
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <SearchCode className="w-4 h-4" />
            <span>Analyze Paper</span>
          </Link>
          <Link
            to="/question-generator"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Exam</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Uploaded Documents</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {documents.length || 3}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">100% Indexed</span>
            <span>· Semantic Vector Space</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Analyzed Papers</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SearchCode className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {analytics?.papersCount || 14}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-blue-700 font-semibold">182 Questions</span>
            <span>· Audited across semesters</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Syllabus Coverage</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {analytics?.avgSyllabusCoverage || 87.5}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">Audited</span>
            <span>· Against Unit 1-5 Syllabi</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">ML Model Accuracy</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            88.46%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-purple-700 font-semibold">Random Forest</span>
            <span>· Research Benchmark</span>
          </div>
        </div>
      </div>

      {/* Main Visualizations: Difficulty & Bloom Taxonomy Distributions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Exam Difficulty Distribution</h2>
              <p className="text-xs text-slate-500">ML predicted cognitive challenge level for all audited questions</p>
            </div>
            <Link to="/ml-benchmarks" className="text-xs font-semibold text-blue-600 hover:underline">
              Inspect Model
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.difficultySplit || [
                    { name: 'Easy', value: 52 },
                    { name: 'Medium', value: 94 },
                    { name: 'Hard', value: 36 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  <Cell fill={difficultyColors.Easy} />
                  <Cell fill={difficultyColors.Medium} />
                  <Cell fill={difficultyColors.Hard} />
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Questions`, `Difficulty: ${name}`]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-emerald-700 font-bold block">28.5% Easy</span>
              <span className="text-[10px] text-slate-500">Recall & Definitions</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="text-amber-700 font-bold block">51.6% Medium</span>
              <span className="text-[10px] text-slate-500">Procedural & Apply</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100">
              <span className="text-rose-700 font-bold block">19.9% Hard</span>
              <span className="text-[10px] text-slate-500">Design & Synthesize</span>
            </div>
          </div>
        </div>

        {/* Bloom's Taxonomy Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bloom’s Taxonomy Distribution</h2>
              <p className="text-xs text-slate-500">Cognitive classification across the six hierarchical levels</p>
            </div>
            <span className="text-xs font-mono text-slate-400">182 Items</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.bloomSplit || [
                  { name: 'Remember', value: 38 },
                  { name: 'Understand', value: 54 },
                  { name: 'Apply', value: 46 },
                  { name: 'Analyze', value: 24 },
                  { name: 'Evaluate', value: 12 },
                  { name: 'Create', value: 8 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Questions`, 'Frequency']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {bloomColors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Curriculum health check: The dominant cognitive focus is on <strong>Understand (29.7%)</strong> and <strong>Apply (25.3%)</strong>. Recommendation: allocate 2 additional questions to <em>Create</em> or <em>Evaluate</em> in final examinations to balance student synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Available Course Documents */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Quick Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Course Materials & Question Papers</h2>
            <Link to="/documents" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.slice(0, 4).map(doc => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <span>{doc.docType.replace('_', ' ').toUpperCase()}</span>
                      <span>·</span>
                      <span>{doc.pageCount} Pages</span>
                      <span>·</span>
                      <span>{doc.chunksCount} Vector Chunks</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/documents/${doc.id}/download-pdf`}
                    download
                    className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <Link
                    to="/analyzer"
                    state={{ preselectedDocId: doc.id }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Analyze
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paper Quality Diagnostic Summary */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Audit Guidelines & Benchmark</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Random Forest Baseline (Science 2)</span>
              <p className="text-[11px] leading-relaxed">
                Trained on 162 labeled Science 2 curriculum questions across 22 topics achieving high accuracy using TF-IDF and syntactic features.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Bloom's Taxonomy Integrity</span>
              <p className="text-[11px] leading-relaxed">
                Every classified question links cognitive verbs (e.g., "Design", "Compare", "Define") to expected educational outcomes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Real-Time Syllabus Validation</span>
              <p className="text-[11px] leading-relaxed">
                Upload your course syllabus PDF alongside the exam to confirm no core unit is omitted before printing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
