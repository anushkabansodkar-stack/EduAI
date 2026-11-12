import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  GraduationCap, 
  UserCheck, 
  LogOut, 
  Bell, 
  BookOpen, 
  Menu,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 bg-clip-text text-transparent">
              EduAI
            </span>
            <span className="text-[10px] font-medium text-slate-600 tracking-wider uppercase -mt-1 hidden sm:inline">
              Smart Assessment & Learning
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Active mode / quick badge */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Gemini 3.8 Flash</span>
        </span>
        <span className="text-slate-400">·</span>
        <span className="font-medium text-slate-700">88.46% RF Benchmark</span>
        <span className="text-slate-400">·</span>
        <span className="text-emerald-700 font-medium">Vector RAG Ready</span>
      </div>

      {/* Right: Role Switcher & Profile dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role switcher toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => switchRole('teacher')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              role === 'teacher'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch to Teacher View"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Teacher</span>
          </button>
          <button
            onClick={() => switchRole('student')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              role === 'student'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch to Student View"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Student</span>
          </button>
        </div>

        {/* User preview & profile */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] text-slate-600 capitalize">
                {user?.role} Mode
              </span>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
