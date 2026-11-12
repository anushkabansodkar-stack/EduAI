import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, UserCheck, BookOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('teacher');
  const [email, setEmail] = useState('s.jenkins@stanford.edu');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/dashboard');
  };

  const handleQuickDemoLogin = (selectedRole: UserRole) => {
    if (selectedRole === 'teacher') {
      login('s.jenkins@stanford.edu', 'teacher', 'Dr. Sarah Jenkins');
    } else {
      login('alex.chen@student.edu', 'student', 'Alex Chen');
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to EduAI</h2>
          <p className="text-xs text-slate-500">
            Sign in to access question paper analytics and learning tools
          </p>
        </div>

        {/* 1-Click Quick Demo Switcher */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Instant 1-Click Role Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('teacher')}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-all hover:bg-blue-50/50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Teacher Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 rounded-lg text-xs font-semibold shadow-xs transition-all hover:bg-indigo-50/50"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Student Demo</span>
            </button>
          </div>
        </div>

        {/* Role toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setRole('teacher');
              setEmail('s.jenkins@stanford.edu');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              role === 'teacher'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teacher / Faculty
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setEmail('alex.chen@student.edu');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              role === 'student'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Scholar
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Sign In to EduAI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register Institutional Account
          </Link>
        </div>
      </div>
    </div>
  );
};
