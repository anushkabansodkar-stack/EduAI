import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUser: (data: Partial<User>) => void;
}

const DEFAULT_TEACHER: User = {
  id: 'usr_teacher_01',
  name: 'Dr. Sarah Jenkins',
  email: 's.jenkins@stanford.edu',
  role: 'teacher',
  institution: 'Department of Computer Science & Engineering',
  department: 'Faculty of Natural Sciences',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

const DEFAULT_STUDENT: User = {
  id: 'usr_student_01',
  name: 'Alex Chen',
  email: 'alex.chen@student.edu',
  role: 'student',
  institution: 'Faculty of Computer Science',
  department: 'Undergraduate Program (Year 3)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('eduai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_TEACHER;
      }
    }
    return DEFAULT_TEACHER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('eduai_user', JSON.stringify(user));
    }
  }, [user]);

  const login = (email: string, role: UserRole, name?: string) => {
    const base = role === 'teacher' ? DEFAULT_TEACHER : DEFAULT_STUDENT;
    setUser({
      ...base,
      email,
      role,
      name: name || (role === 'teacher' ? 'Prof. ' + email.split('@')[0] : email.split('@')[0]),
    });
  };

  const logout = () => {
    localStorage.removeItem('eduai_user');
    setUser(DEFAULT_STUDENT);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'teacher') {
      setUser(DEFAULT_TEACHER);
    } else {
      setUser(DEFAULT_STUDENT);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
