import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  BarChart2, 
  SearchCode, 
  BotMessageSquare, 
  FileText, 
  ShieldCheck, 
  BrainCircuit, 
  Cpu, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="border-b border-slate-100 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 bg-clip-text text-transparent">
              EduAI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#research" className="hover:text-blue-600 transition-colors">ML Accuracy (88.46%)</a>
            <a href="#bloom" className="hover:text-blue-600 transition-colors">Bloom's Taxonomy</a>
            <a href="#rag" className="hover:text-blue-600 transition-colors">RAG Chatbot</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smarter Question Papers. Personalized Learning.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            AI-Powered Question Paper Analysis & Academic Intelligence
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Automate question difficulty prediction with an 88.46% validated Random Forest model, classify cognitive depth with Bloom’s Taxonomy, and empower students with document-grounded RAG tutoring.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/dashboard"
              onClick={() => switchRole('teacher')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Explore as Teacher</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              onClick={() => switchRole('student')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold shadow-xs transition-all hover:border-slate-300"
            >
              <span>Explore as Student</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block">ML Validation Accuracy</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">88.46%</span>
              <span className="text-[11px] text-blue-600 font-medium block mt-0.5">Random Forest Held-Out Test</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block">Bloom's Taxonomy</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">6 Levels</span>
              <span className="text-[11px] text-indigo-600 font-medium block mt-0.5">Remember to Create</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block">Document RAG</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Zero-Hallucination</span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Exact Page Citations</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block">Syllabus Coverage</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Automatic</span>
              <span className="text-[11px] text-purple-600 font-medium block mt-0.5">Gap & Overlap Detection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-50/60 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Comprehensive Architecture</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Engineered for Academic Excellence</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Combining machine learning classification pipelines with Google Gemini generative intelligence for educators and scholars.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <SearchCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Question Paper Analyzer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extract questions from PDFs, predict difficulty (Easy, Medium, Hard), classify cognitive depth, detect repetition, and audit syllabus coverage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Machine Learning Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                TF-IDF combined with linguistic features (syntactic complexity, action verbs, punctuation density) trained with Random Forest and SVM benchmarks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Student RAG Chatbot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students ask complex academic questions answered strictly from uploaded course materials with source document names and page numbers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">AI Paper Generator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate section-wise examination papers with verified total marks, balanced Bloom distributions, model answers, and printable layouts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Syllabus Coverage Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare examination questions against the course syllabus to identify covered topics, under-represented units, and unassessed learning objectives.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Adaptive Practice Quizzes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Self-paced quizzes for students with immediate explanations, weak topic diagnostics, and personalized revision recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Benchmark Spotlight */}
      <section id="research" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Empirical Research Benchmark</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                88.46% Held-Out Validation Accuracy
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                As reported in the research presentation on an empirical dataset of 128 academic examination questions using an ensemble Random Forest model with TF-IDF and syntactic linguistic features.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-300">
                <span>· Precision: 89.12%</span>
                <span>· Recall: 88.46%</span>
                <span>· F1-Score: 88.75%</span>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3">
              <Link
                to="/ml-benchmarks"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-colors shadow-md shadow-blue-500/20"
              >
                Inspect ML Benchmark Lab
              </Link>
              <Link
                to="/analyzer"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors border border-slate-700"
              >
                Test Paper Analyzer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 bg-slate-50 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">EduAI</span>
            <span>– Smarter Question Papers. Personalized Learning.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-900 transition-colors">Faculty Portal</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Student Portal</Link>
            <Link to="/documents" className="hover:text-slate-900 transition-colors">Document Library</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
