import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardDispatcher: React.FC = () => {
  const { role } = useAuth();
  return role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
};
