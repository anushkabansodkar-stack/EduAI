import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  Save, 
  Sparkles,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, role, updateUser, switchRole } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [institution, setInstitution] = useState(user?.institution || 'Department of Computer Science & Engineering');
  const [department, setDepartment] = useState(user?.department || 'Faculty of Natural Sciences');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, institution, department });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your institutional identity, active role permissions, and AI pipeline configurations.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile configuration updated successfully.</span>
        </div>
      )}

      {/* Role Switcher Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Active Workspace Role
          </span>
          <h2 className="text-base font-bold text-slate-900 capitalize mt-0.5">
            {role === 'teacher' ? 'Faculty / Professor Role' : 'Student Scholar Role'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'teacher'
              ? 'Has access to question paper generation, difficulty analysis, syllabus auditing, and student diagnostics.'
              : 'Has access to RAG academic tutor, practice quizzes, and personal learning progress.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchRole('teacher')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              role === 'teacher'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Switch to Teacher
          </button>
          <button
            type="button"
            onClick={() => switchRole('student')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              role === 'student'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Switch to Student
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backend & Model Integration Status Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Server className="w-4 h-4 text-blue-600" />
          <h2>AI System Status & Models</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Generative Engine</span>
            <span className="font-bold text-slate-900">Gemini 3.8 Flash</span>
            <span className="text-[10px] text-emerald-700 block">Server-Side Proxy</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Difficulty Model</span>
            <span className="font-bold text-slate-900">Random Forest Ensemble</span>
            <span className="text-[10px] text-blue-700 block">88.46% Validation Baseline</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block">RAG Vector Index</span>
            <span className="font-bold text-slate-900">Cosine TF-IDF Space</span>
            <span className="text-[10px] text-indigo-700 block">Exact Page Citations</span>
          </div>
        </div>
      </div>
    </div>
  );
};
