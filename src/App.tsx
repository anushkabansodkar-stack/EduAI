import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardDispatcher } from './pages/DashboardDispatcher';
import { DocumentManagerPage } from './pages/DocumentManagerPage';
import { QuestionAnalyzerPage } from './pages/QuestionAnalyzerPage';
import { QuestionGeneratorPage } from './pages/QuestionGeneratorPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { QuizPage } from './pages/QuizPage';
import { SyllabusCoveragePage } from './pages/SyllabusCoveragePage';
import { MLPerformancePage } from './pages/MLPerformancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application routes inside AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardDispatcher />} />
            <Route path="/documents" element={<DocumentManagerPage />} />
            <Route path="/analyzer" element={<QuestionAnalyzerPage />} />
            <Route path="/question-generator" element={<QuestionGeneratorPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/syllabus" element={<SyllabusCoveragePage />} />
            <Route path="/ml-benchmarks" element={<MLPerformancePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
