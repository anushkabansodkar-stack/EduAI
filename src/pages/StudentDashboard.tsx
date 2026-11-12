import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  BotMessageSquare, 
  CheckSquare, 
  TrendingUp, 
  ArrowRight, 
  Target, 
  Clock, 
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { fetchDocuments } from '../services/api';
import { DocumentItem } from '../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(() => {});
  }, []);

  const progressData = [
    { attempt: 'Quiz 1', score: 68, topic: 'Heredity & Evolution' },
    { attempt: 'Quiz 2', score: 74, topic: 'Protein Synthesis' },
    { attempt: 'Quiz 3', score: 82, topic: 'Disaster Management' },
    { attempt: 'Quiz 4', score: 86, topic: 'Human Reproductive System' },
    { attempt: 'Quiz 5', score: 90, topic: 'Theories of Evolution' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Scholar'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized study hub powered by your verified course documents and AI tutoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/chatbot"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
          >
            <BotMessageSquare className="w-4 h-4" />
            <span>Ask Academic RAG Tutor</span>
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Start Practice Quiz</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Quizzes Completed</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">5</div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">+2 this week</span>
            <span>· Continuous Practice</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Average Score</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">80.0%</div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">Grade A-</span>
            <span>· Mastery trajectory</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Course Materials</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{documents.length || 3}</div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-blue-700 font-semibold">Indexed</span>
            <span>· Ready for Q&A</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Target Weak Topics</span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600">1 Area</div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Sorting Degeneracy Cases</span>
          </div>
        </div>
      </div>

      {/* Progress Chart & Weak Areas Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Learning Mastery Curve */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Quiz Performance & Score Trajectory</h2>
              <p className="text-xs text-slate-500">Chronological score progression across practice sessions</p>
            </div>
            <Link to="/quiz" className="text-xs font-semibold text-blue-600 hover:underline">
              Take New Quiz
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [`${val}%`, item.payload.topic]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Overall trend: <strong>+15% improvement</strong> compared to first baseline attempt.</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Target: 90%</span>
          </div>
        </div>

        {/* Weak Topics Diagnostic & Action Plan */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2>Diagnostic & Revision Focus</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Theories of Evolution & Lamarckism</span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">Needs Work</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Review differences between Darwin&apos;s Natural Selection vs Lamarck&apos;s Theory of Use and Disuse of Organs, plus transcription in Protein Synthesis.
              </p>
              <div className="pt-1">
                <Link
                  to="/chatbot"
                  state={{ prompt: 'Explain Darwin\'s theory of natural selection versus Lamarckism with examples, and why Lamarck\'s theory was objected to.' }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline"
                >
                  <span>Ask Science 2 RAG Tutor to clarify this</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                <span>Recommended Science 2 Revision Plan</span>
              </div>
              <ul className="text-[11px] text-blue-800 space-y-1 list-disc list-inside">
                <li>Read Chapter 1 Heredity &amp; Evolution textbook notes.</li>
                <li>Generate a 5-question focused quiz on Protein Synthesis (mRNA, tRNA, rRNA).</li>
                <li>Practice anatomical vs paleontological evidences of evolution.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Study Materials Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your Indexed Course Study Materials</h2>
            <p className="text-xs text-slate-500">Verified documents available for the AI Academic Chatbot</p>
          </div>
          <Link to="/documents" className="text-xs font-semibold text-blue-600 hover:underline">
            Manage Documents
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 truncate">{doc.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {doc.previewSnippet}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-600">{doc.pageCount} Pages</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/documents/${doc.id}/download-pdf`}
                    download
                    className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/chatbot"
                    state={{ selectedDocId: doc.id }}
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>Chat with Doc</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
