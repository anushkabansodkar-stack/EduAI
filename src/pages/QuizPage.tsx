import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  BookOpen,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { generateQuiz, submitQuizAttempt, fetchDocuments } from '../services/api';
import { Quiz, QuizQuestion, QuizAttempt, DocumentItem, DifficultyLevel } from '../types';
import { DifficultyBadge } from '../components/common/Badges';
import { SCIENCE2_TOPICS } from '../data/science2Data';

export const QuizPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  // Quiz configuration
  const [subject, setSubject] = useState('Science 2');
  const [topic, setTopic] = useState<string>('protein synthesis');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'Mixed'>('Mixed');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [selectedDocId, setSelectedDocId] = useState('');

  // Interactive Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments().then(docs => {
      setDocuments(docs);
      if (docs.length > 0) setSelectedDocId(docs[0].id);
    }).catch(() => {});
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || attemptResult) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, attemptResult]);

  const handleStartNewQuiz = async () => {
    setLoading(true);
    setAttemptResult(null);
    setUserAnswers({});
    setCurrentQIndex(0);

    try {
      const qz = await generateQuiz({
        subject,
        topic,
        questionCount,
        difficulty,
        durationMinutes,
        documentId: selectedDocId || undefined,
      });
      setActiveQuiz(qz);
      setTimeLeftSeconds(qz.durationMinutes * 60);
    } catch (err: any) {
      alert('Failed to generate quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optionText: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionText }));
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = activeQuiz.questions.map(q => ({
        questionId: q.id,
        userAnswer: userAnswers[q.id] || '',
        correctAnswer: q.correctAnswer,
        topic: q.topic,
      }));

      const attempt = await submitQuizAttempt({
        quizId: activeQuiz.id,
        answers: formattedAnswers as any,
        timeSpentSeconds: activeQuiz.durationMinutes * 60 - timeLeftSeconds,
      });

      setAttemptResult(attempt);
      if (attempt.percentage >= 75) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert('Error evaluating test: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Practice Quizzes & Diagnostic Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate targeted adaptive quizzes, get instant explanations, and target your weak topics.
          </p>
        </div>

        {activeQuiz && !attemptResult && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Time Remaining: {formatTimer(timeLeftSeconds)}</span>
          </div>
        )}
      </div>

      {/* Quiz Configuration Form if not currently testing */}
      {!activeQuiz && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Configure Practice Session</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Focus (Science 2)</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {SCIENCE2_TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grounded in Document
              </label>
              <select
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">-- General Knowledge --</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Question Count</label>
              <select
                value={questionCount}
                onChange={e => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value={3}>3 Questions (Quick Sprint)</option>
                <option value={5}>5 Questions (Standard Practice)</option>
                <option value={10}>10 Questions (Full Assessment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Mixed">Mixed (Balanced)</option>
                <option value="Easy">Easy (Conceptual Recall)</option>
                <option value="Medium">Medium (Application)</option>
                <option value="Hard">Hard (Analytical Design)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Duration</label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartNewQuiz}
              disabled={loading}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
              <span>{loading ? 'Generating Adaptive Quiz...' : 'Generate & Start Quiz'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Interactive Quiz Taker */}
      {activeQuiz && !attemptResult && (
        <div className="space-y-6">
          {/* Question Stepper Indicator */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2">
              {activeQuiz.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentQIndex === idx
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                      : userAnswers[q.id]
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Question {currentQIndex + 1} of {activeQuiz.questions.length}
            </span>
          </div>

          {/* Active Question Box */}
          {activeQuiz.questions[currentQIndex] && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Topic: {activeQuiz.questions[currentQIndex].topic}
                </span>
                <DifficultyBadge difficulty={activeQuiz.questions[currentQIndex].difficulty} />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {activeQuiz.questions[currentQIndex].text}
              </h2>

              <div className="space-y-3">
                {activeQuiz.questions[currentQIndex].options?.map((opt, optIdx) => {
                  const isSelected = userAnswers[activeQuiz.questions[currentQIndex].id] === opt;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(activeQuiz.questions[currentQIndex].id, opt)}
                      className={`w-full text-left p-4 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                >
                  Previous Question
                </button>

                {currentQIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Scoring Answers...' : 'Submit & Grade Quiz'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Attempt Diagnostic Results */}
      {attemptResult && activeQuiz && (
        <div className="space-y-6">
          {/* Result Card */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Assessment Completed
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {activeQuiz.title}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Final Score</span>
                  <span className="text-3xl font-black text-indigo-700 tracking-tight">
                    {attemptResult.score} / {attemptResult.totalQuestions}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-lg">
                  {attemptResult.percentage}%
                </div>
              </div>
            </div>

            {/* Diagnostic recommendations */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Weak Topics Diagnostic</span>
                {attemptResult.weakTopics.length > 0 ? (
                  <div className="space-y-1">
                    {attemptResult.weakTopics.map((wt, i) => (
                      <div key={i} className="text-xs text-rose-700 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>{wt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No weak areas identified. Perfect topic accuracy!</span>
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <span className="text-xs font-bold text-blue-900 block">Recommended Action Items</span>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  {attemptResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question-by-question breakdown with explanations */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Question-by-Question Detailed Review</h3>
              <div className="space-y-4">
                {activeQuiz.questions.map((q, i) => {
                  const userAns = attemptResult.answers.find(a => a.questionId === q.id);
                  const isCorrect = userAns?.isCorrect;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-2 text-xs ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200/80'
                          : 'bg-rose-50/40 border-rose-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-bold text-slate-900">
                          {i + 1}. {q.text}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold shrink-0">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] space-y-0.5 pt-1">
                        <p className="text-slate-600">
                          Your response: <strong className={isCorrect ? 'text-emerald-800' : 'text-rose-800'}>{userAns?.userAnswer || 'No answer'}</strong>
                        </p>
                        {!isCorrect && (
                          <p className="text-slate-800 font-medium">
                            Correct answer: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                          </p>
                        )}
                        <p className="text-slate-700 pt-1 leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-200/60">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setAttemptResult(null);
                }}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Configure Another Practice Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
