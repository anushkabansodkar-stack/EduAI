export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  department?: string;
  avatarUrl?: string;
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type BloomLevel = 
  | 'Remember'
  | 'Understand'
  | 'Apply'
  | 'Analyze'
  | 'Evaluate'
  | 'Create';

export interface QuestionAnalysis {
  id: string;
  number: number | string;
  text: string;
  difficulty: DifficultyLevel;
  difficultyConfidence: number; // 0 to 1
  bloomLevel: BloomLevel;
  bloomReason: string;
  bloomConfidence: number; // 0 to 1
  topic: string;
  marks?: number;
  cognitiveKeywords?: string[];
  isEdited?: boolean;
}

export interface PaperSummary {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  uploadedAt: string;
  totalQuestions: number;
  totalMarks: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  bloomDistribution: Record<BloomLevel, number>;
  topicDistribution: Record<string, number>;
  syllabusCoveragePercent?: number;
  syllabusReferenceDoc?: string;
  redundantQuestions?: string[];
  coverageGaps?: string[];
  suggestions: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  originalFileName: string;
  sizeBytes: number;
  uploadedAt: string;
  ownerId: string;
  ownerRole: UserRole;
  docType: 'question_paper' | 'syllabus' | 'study_material';
  status: 'uploaded' | 'processing' | 'indexed' | 'error';
  pageCount: number;
  chunksCount: number;
  previewSnippet?: string;
  content?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  text: string;
  tokenCount: number;
  topic?: string;
}

export interface GeneratedQuestion {
  id: string;
  section: string;
  questionNumber: number;
  text: string;
  questionType: 'mcq' | 'short' | 'long';
  marks: number;
  difficulty: DifficultyLevel;
  bloomLevel: BloomLevel;
  topic: string;
  options?: string[];
  correctAnswer: string;
  modelAnswer?: string;
  markingCriteria?: string[];
  suggestedMarks?: string;
}

export interface GeneratedPaper {
  id: string;
  title: string;
  subject: string;
  academicLevel: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: {
    sectionName: string;
    instructions: string;
    totalMarks: number;
    questions: GeneratedQuestion[];
  }[];
  topicSummary: Record<string, number>;
  difficultySummary: Record<DifficultyLevel, number>;
  bloomSummary: Record<BloomLevel, number>;
  targetDifficultyCounts?: {
    easy: number;
    medium: number;
    hard: number;
  };
  cognitiveBalanceVerified?: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  questionType: 'mcq' | 'short';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: DifficultyLevel;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  difficulty: DifficultyLevel | 'Mixed';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  completedAt: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  topicBreakdown: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  recommendations: string[];
}

export interface ChatSourceCitation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  snippet: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: ChatSourceCitation[];
  suggestedFollowUps?: string[];
  isGrounded?: boolean;
}

export interface MLModelMetrics {
  modelName: string;
  validationAccuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  crossValMean: number;
  crossValStd: number;
  sampleCount: number;
  classes: DifficultyLevel[];
  confusionMatrix: number[][]; // 3x3 for Easy, Medium, Hard
  topFeatures: { feature: string; importance: number }[];
  isHistoricalBenchmark?: boolean;
  notes?: string;
}

export interface SyllabusTopicCoverage {
  topic: string;
  syllabusImportance: 'Core' | 'Major' | 'Supplementary';
  paperQuestionsCount: number;
  paperMarksAllocated: number;
  coverageStatus: 'Adequate' | 'Low Representation' | 'Not Detected';
  identifiedQuestions: string[];
}
