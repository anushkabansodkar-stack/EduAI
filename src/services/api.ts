import { 
  DocumentItem, 
  QuestionAnalysis, 
  PaperSummary, 
  GeneratedPaper, 
  Quiz, 
  QuizAttempt, 
  ChatMessage, 
  MLModelMetrics,
  SyllabusTopicCoverage,
  DifficultyLevel,
  BloomLevel
} from '../types';

export const API_BASE = '/api';

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(formData: FormData): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload document');
  }
  return res.json();
}

export async function processDocument(id: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/documents/${id}/process`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to process document');
  return res.json();
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

export async function fetchDocumentById(id: string): Promise<DocumentItem & { rawText?: string }> {
  const res = await fetch(`${API_BASE}/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document content');
  return res.json();
}

export interface OfficialPdfItem {
  id: string;
  title: string;
  pageCount: number;
  fileName: string;
  downloadUrl: string;
  directPdfUrl: string;
  description: string;
  sizeKB: number;
  docType: string;
}

export async function fetchOfficialPdfs(): Promise<OfficialPdfItem[]> {
  const res = await fetch(`${API_BASE}/official-pdfs`);
  if (!res.ok) throw new Error('Failed to fetch official PDFs');
  return res.json();
}

export interface AnalyzePaperRequest {
  documentId?: string;
  rawQuestionsText?: string;
  syllabusDocumentId?: string;
}

export interface AnalyzePaperResponse {
  summary: PaperSummary;
  questions: QuestionAnalysis[];
  syllabusTopics?: SyllabusTopicCoverage[];
}

export async function analyzeQuestionPaper(payload: AnalyzePaperRequest): Promise<AnalyzePaperResponse> {
  const res = await fetch(`${API_BASE}/analyze-question-paper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze question paper');
  }
  return res.json();
}

export async function predictDifficulty(text: string): Promise<{
  difficulty: DifficultyLevel;
  confidence: number;
  features: {
    length: number;
    wordCount: number;
    cognitiveScore: number;
    hasComplexFormula: boolean;
    punctuationDensity: number;
  };
}> {
  const res = await fetch(`${API_BASE}/predict-difficulty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionText: text }),
  });
  if (!res.ok) throw new Error('Failed to predict difficulty');
  return res.json();
}

export async function classifyBloom(text: string): Promise<{
  bloomLevel: BloomLevel;
  reason: string;
  confidence: number;
  keywords: string[];
}> {
  const res = await fetch(`${API_BASE}/classify-bloom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionText: text }),
  });
  if (!res.ok) throw new Error('Failed to classify Bloom level');
  return res.json();
}

export interface GeneratePaperConfig {
  subject: string;
  academicLevel: string;
  referenceDocId?: string;
  topics: string[];
  totalMarks: number;
  questionCount: number;
  durationMinutes: number;
  questionTypes: ('mcq' | 'short' | 'long')[];
  difficultyDistribution: { easy: number; medium: number; hard: number };
  difficultyCounts?: { easy: number; medium: number; hard: number };
  divideByCognitiveDifficulty?: boolean;
  bloomDistribution?: Partial<Record<BloomLevel, number>>;
}

export async function generateQuestionPaper(config: GeneratePaperConfig): Promise<GeneratedPaper> {
  const res = await fetch(`${API_BASE}/generate-question-paper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate question paper');
  }
  return res.json();
}

export async function sendChatMessage(query: string, documentId?: string): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, documentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Chat query failed');
  }
  return res.json();
}

export interface GenerateQuizConfig {
  subject: string;
  topic: string;
  questionCount: number;
  difficulty: DifficultyLevel | 'Mixed';
  durationMinutes: number;
  documentId?: string;
}

export async function generateQuiz(config: GenerateQuizConfig): Promise<Quiz> {
  const res = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Quiz generation failed');
  }
  return res.json();
}

export async function submitQuizAttempt(payload: {
  quizId: string;
  answers: { questionId: string; userAnswer: string }[];
  timeSpentSeconds: number;
}): Promise<QuizAttempt> {
  const res = await fetch(`${API_BASE}/submit-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit quiz');
  }
  return res.json();
}

export async function fetchMLMetrics(): Promise<{
  randomForest: MLModelMetrics;
  svm: MLModelMetrics;
  benchmark128Paper: MLModelMetrics;
}> {
  const res = await fetch(`${API_BASE}/ml-metrics`);
  if (!res.ok) throw new Error('Failed to load ML metrics');
  return res.json();
}

export async function fetchAnalyticsData(): Promise<{
  papersCount: number;
  questionsCount: number;
  documentsCount: number;
  avgSyllabusCoverage: number;
  quizzesTaken: number;
  avgStudentScore: number;
  difficultySplit: { name: string; value: number }[];
  bloomSplit: { name: string; value: number }[];
  monthlyActivity: { month: string; papers: number; quizzes: number }[];
  weakTopicsAggregate: { topic: string; struggleRate: number }[];
}> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}
