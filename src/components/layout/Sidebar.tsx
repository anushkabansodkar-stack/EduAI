import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  SearchCode, 
  Sparkles, 
  BotMessageSquare, 
  CheckSquare, 
  BarChart3, 
  Binary, 
  Layers, 
  User, 
  HelpCircle,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = true, onClose }) => {
  const { role, user } = useAuth();

  const teacherNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Document Center', path: '/documents', icon: FileText, badge: 'PDF' },
    { name: 'Question Paper Analyzer', path: '/analyzer', icon: SearchCode, highlight: true },
    { name: 'AI Paper Generator', path: '/question-generator', icon: Sparkles },
    { name: 'Syllabus Alignment', path: '/syllabus', icon: Layers },
    { name: 'ML Classifier Lab', path: '/ml-benchmarks', icon: Binary, badge: '88.5%' },
    { name: 'Institutional Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Student RAG Tutor', path: '/chatbot', icon: BotMessageSquare },
    { name: 'Practice Quizzes', path: '/quiz', icon: CheckSquare },
  ];

  const studentNavItems: NavItem[] = [
    { name: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Academic Tutor (RAG)', path: '/chatbot', icon: BotMessageSquare, highlight: true },
    { name: 'Practice Quizzes', path: '/quiz', icon: CheckSquare },
    { name: 'Course Documents', path: '/documents', icon: FileText },
    { name: 'Learning Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Difficulty Predictor', path: '/ml-benchmarks', icon: Binary },
  ];

  const items = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {/* User profile role badge banner */}
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600">
                Current Role
              </span>
              <span className="text-xs font-bold text-slate-800 capitalize">
                {role === 'teacher' ? 'Faculty / Teacher' : 'Student Scholar'}
              </span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                role === 'teacher' ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-indigo-600 ring-4 ring-indigo-100'
              }`}
            />
          </div>

          {/* Nav Items List */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {role === 'teacher' ? 'Faculty Modules' : 'Learning Workspace'}
            </div>
            {items.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50/90 text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-100/70 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Quick Upload Action */}
          <div className="pt-2">
            <NavLink
              to="/documents"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </NavLink>
          </div>
        </div>

        {/* Bottom account / settings footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
          <NavLink
            to="/profile"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>Account & Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};
