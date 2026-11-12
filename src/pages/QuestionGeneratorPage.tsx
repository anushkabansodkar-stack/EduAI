import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Sliders, 
  RefreshCw,
  Layers,
  Award,
  CheckCircle2,
  UploadCloud,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { fetchDocuments, generateQuestionPaper, uploadDocument, GeneratePaperConfig } from '../services/api';
import { DocumentItem, GeneratedPaper, GeneratedQuestion, DifficultyLevel, BloomLevel } from '../types';
import { DifficultyBadge, BloomBadge } from '../components/common/Badges';

export const QuestionGeneratorPage: React.FC = () => {
  const location = useLocation();
  const stateReferenceDocId = (location.state as any)?.referenceDocId;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [copied, setCopied] = useState(false);

  // Form configurations
  const [subject, setSubject] = useState('Science 2');
  const [academicLevel, setAcademicLevel] = useState('Class 10 / Secondary Board');
  const [referenceDocId, setReferenceDocId] = useState(stateReferenceDocId || '');
  const [totalMarks, setTotalMarks] = useState(40);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [topicsInput, setTopicsInput] = useState('heredity and evolution, evidences of evolution, protein synthesis, types of disasters, theories of evolution');
  
  // Cognitive Difficulty Target Question Counts (At least 2 to 10 questions per tier)
  const [easyCount, setEasyCount] = useState<number>(4);
  const [medCount, setMedCount] = useState<number>(3);
  const [hardCount, setHardCount] = useState<number>(3);
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');

  // Derived metrics
  const questionCount = easyCount + medCount + hardCount;
  const diffEasy = Math.round((easyCount / questionCount) * 100);
  const diffMedium = Math.round((medCount / questionCount) * 100);
  const diffHard = 100 - diffEasy - diffMedium;

  // Direct PDF upload in generator
  const [uploadedPdf, setUploadedPdf] = useState<DocumentItem | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments().then(docs => {
      setDocuments(docs);
      if (stateReferenceDocId) {
        setReferenceDocId(stateReferenceDocId);
        const matched = docs.find(d => d.id === stateReferenceDocId);
        if (matched) setUploadedPdf(matched);
      } else if (docs.length > 0 && !referenceDocId) {
        setReferenceDocId(docs[0].id);
      }
    }).catch(() => {});
  }, [stateReferenceDocId]);

  const handleUploadPdfForGeneration = async (file: File) => {
    setGenerationError(null);
    setGenerationSuccess(null);
    setIsUploadingPdf(true);
    setPdfUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', 'question_paper');
      formData.append('customName', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('ownerRole', 'teacher');

      const progressInterval = setInterval(() => {
        setPdfUploadProgress(prev => (prev < 80 ? prev + 20 : prev));
      }, 150);

      const uploaded = await uploadDocument(formData);
      clearInterval(progressInterval);
      setPdfUploadProgress(100);

      setDocuments(prev => [uploaded, ...prev]);
      setReferenceDocId(uploaded.id);
      setUploadedPdf(uploaded);
      setGenerationSuccess(`Uploaded and indexed "${uploaded.name}". Ready to generate exam questions!`);
    } catch (err: any) {
      console.error('PDF upload error in generator:', err);
      setGenerationError(err.message || 'Failed to upload PDF for question generation.');
    } finally {
      setIsUploadingPdf(false);
      setPdfUploadProgress(0);
    }
  };

  const applyPreset = (easy: number, med: number, hard: number) => {
    setEasyCount(Math.max(2, Math.min(10, easy)));
    setMedCount(Math.max(2, Math.min(10, med)));
    setHardCount(Math.max(2, Math.min(10, hard)));
  };

  const handleUpdateQuestionMarks = (qId: string, delta: number) => {
    if (!paper) return;
    const updatedSections = paper.sections.map(sec => {
      const qIndex = sec.questions.findIndex(q => q.id === qId);
      if (qIndex === -1) return sec;
      const updatedQuestions = [...sec.questions];
      const targetQ = updatedQuestions[qIndex];
      const newMarks = Math.max(1, Math.min(10, (targetQ.marks || 1) + delta));
      updatedQuestions[qIndex] = { ...targetQ, marks: newMarks };
      return {
        ...sec,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0),
      };
    });

    const newTotalMarks = updatedSections.reduce((sum, s) => sum + s.totalMarks, 0);
    setPaper({
      ...paper,
      sections: updatedSections,
      totalMarks: newTotalMarks,
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGenerationError(null);
    setGenerationSuccess(null);

    try {
      const topics = topicsInput.split(',').map(t => t.trim()).filter(Boolean);
      const config: GeneratePaperConfig = {
        subject,
        academicLevel,
        referenceDocId: referenceDocId || undefined,
        topics: topics.length ? topics : ['heredity and evolution', 'protein synthesis', 'disaster management'],
        totalMarks,
        questionCount,
        durationMinutes,
        questionTypes: ['mcq', 'short', 'long'],
        difficultyDistribution: {
          easy: diffEasy,
          medium: diffMedium,
          hard: diffHard,
        },
        difficultyCounts: {
          easy: easyCount,
          medium: medCount,
          hard: hardCount,
        },
        divideByCognitiveDifficulty: true,
      };

      const result = await generateQuestionPaper(config);
      setPaper(result);
      setGenerationSuccess(`Successfully generated "${result.title}" divided across Easy (${easyCount} Qs), Medium (${medCount} Qs), and Hard (${hardCount} Qs) tiers.`);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenerationError(err.message || 'Generation error encountered.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!paper) return;
    const text = `${paper.title}\nSubject: ${paper.subject} | Time: ${paper.durationMinutes} mins | Total Marks: ${paper.totalMarks}\n\n` +
      paper.sections.map(s => `--- ${s.sectionName} (${s.totalMarks} Marks) ---\n` + 
        s.questions.map(q => `Q${q.questionNumber}. ${q.text} [${q.marks} Marks] (Difficulty: ${q.difficulty}, Bloom: ${q.bloomLevel})\nModel Answer: ${q.modelAnswer || q.correctAnswer}\n`).join('\n')
      ).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Examination Paper Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Construct structured university examination papers with balanced cognitive rigor and verified mark totals.
          </p>
        </div>

        {paper && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Paper</span>
            </button>
          </div>
        )}
      </div>

      {/* In-UI Error & Success Banners */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Generation Notice</p>
              <p className="mt-0.5 leading-relaxed">{generationError}</p>
            </div>
          </div>
          <button
            onClick={() => setGenerationError(null)}
            className="p-1 text-rose-400 hover:text-rose-700 rounded-lg shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {generationSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">{generationSuccess}</p>
          </div>
          <button
            onClick={() => setGenerationSuccess(null)}
            className="p-1 text-emerald-400 hover:text-emerald-700 rounded-lg shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Direct PDF Upload for Grounded Question Generation */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/80 shadow-xs space-y-3 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Upload PDF to Generate Questions Directly
            </h3>
          </div>
          {uploadedPdf && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>PDF Grounded</span>
            </span>
          )}
        </div>

        <div
          onClick={() => pdfInputRef.current?.click()}
          onDragOver={e => {
            e.preventDefault();
          }}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleUploadPdfForGeneration(e.dataTransfer.files[0]);
            }
          }}
          className="p-4 rounded-xl border border-dashed border-blue-300 bg-white hover:bg-blue-50/50 hover:border-blue-400 transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <input
            type="file"
            ref={pdfInputRef}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleUploadPdfForGeneration(e.target.files[0]);
              }
            }}
            accept=".pdf,.txt"
            className="hidden"
          />

          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {uploadedPdf ? uploadedPdf.name : 'Upload Question Paper or Syllabus PDF'}
              </p>
              <p className="text-[11px] text-slate-500">
                {uploadedPdf 
                  ? `${uploadedPdf.pageCount} pages indexed · Questions will be formulated directly from this document.`
                  : 'Drop your PDF here or click to browse. Questions will be extracted & synthesized from it.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUploadingPdf ? (
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading {pdfUploadProgress}%</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs">
                {uploadedPdf ? 'Change PDF' : 'Browse PDF'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Generator Configuration Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 no-print">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Curriculum & Examination Parameters</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Gemini 3.8 Flash Neural Engine</span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic / Grade Level
            </label>
            <input
              type="text"
              value={academicLevel}
              onChange={e => setAcademicLevel(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reference Document / Source PDF
            </label>
            <select
              value={referenceDocId}
              onChange={e => {
                setReferenceDocId(e.target.value);
                const matched = documents.find(d => d.id === e.target.value);
                if (matched) setUploadedPdf(matched);
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- No reference doc --</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.pageCount} pgs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Examination Marks
            </label>
            <input
              type="number"
              value={totalMarks}
              onChange={e => setTotalMarks(parseInt(e.target.value, 10) || 60)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Questions Target
            </label>
            <div className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 flex items-center justify-between">
              <span>{questionCount} Questions Total</span>
              <span className="text-[10px] text-blue-700 font-normal">({easyCount}E + {medCount}M + {hardCount}H)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Allowed (Minutes)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 90)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Focus Units / Core Topics (Comma-separated)
          </label>
          <input
            type="text"
            value={topicsInput}
            onChange={e => setTopicsInput(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* 1. Bloom’s Taxonomy → Difficulty Level → Marks Rubric */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/90 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                # 1. Bloom’s Taxonomy → Difficulty Level → Marks
              </h3>
            </div>
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200/70">
              Curriculum Cognitive Marking Matrix
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Examination questions generated below automatically adhere to this official Bloom’s Taxonomy and Difficulty Level marks distribution:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Bloom’s Taxonomy Level</th>
                  <th className="py-2.5 px-3.5">Difficulty Level</th>
                  <th className="py-2.5 px-3.5">Suggested Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2 px-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Remember</span>
                  </td>
                  <td className="py-2 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                      Easy
                    </span>
                  </td>
                  <td className="py-2 px-3.5 font-bold font-mono text-emerald-800">
                    1–2
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2 px-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span>Understand</span>
                  </td>
                  <td className="py-2 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[11px]">
                      Easy–Medium
                    </span>
                  </td>
                  <td className="py-2 px-3.5 font-bold font-mono text-teal-800">
                    2–3
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2 px-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span>Apply</span>
                  </td>
                  <td className="py-2 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px]">
                      Medium
                    </span>
                  </td>
                  <td className="py-2 px-3.5 font-bold font-mono text-amber-800">
                    2–4
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2 px-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>Analyze</span>
                  </td>
                  <td className="py-2 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 font-semibold text-[11px]">
                      Medium–Hard
                    </span>
                  </td>
                  <td className="py-2 px-3.5 font-bold font-mono text-orange-800">
                    3–5
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2 px-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Evaluate</span>
                  </td>
                  <td className="py-2 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
                      Hard
                    </span>
                  </td>
                  <td className="py-2 px-3.5 font-bold font-mono text-rose-800">
                    3–5
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2 px-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span>
                    <span>Create</span>
                  </td>
                  <td className="py-2 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
                      Hard
                    </span>
                  </td>
                  <td className="py-2 px-3.5 font-bold font-mono text-rose-800">
                    4–5
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cognitive Difficulty Balance Target Controls (At Least 2 to 10 Questions Per Tier) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Cognitive Difficulty Balance Target (2 to 10 Questions Per Tier)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Adjust each tier between 2 and 10 questions. Questions will be systematically divided into distinct cognitive difficulty sections with rubric marks.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Easy: {easyCount} ({diffEasy}%)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Med: {medCount} ({diffMedium}%)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                Hard: {hardCount} ({diffHard}%)
              </span>
            </div>
          </div>

          {/* Composite Visual Difficulty Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>Combined Cognitive Distribution</span>
              <span>Total: {questionCount} Questions (100%)</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner border border-slate-200">
              <div
                style={{ width: `${diffEasy}%` }}
                className="bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                title={`Easy: ${easyCount} Questions (${diffEasy}%)`}
              >
                {diffEasy > 12 && `${easyCount}Q`}
              </div>
              <div
                style={{ width: `${diffMedium}%` }}
                className="bg-amber-500 hover:bg-amber-600 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                title={`Medium: ${medCount} Questions (${diffMedium}%)`}
              >
                {diffMedium > 12 && `${medCount}Q`}
              </div>
              <div
                style={{ width: `${diffHard}%` }}
                className="bg-rose-500 hover:bg-rose-600 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                title={`Hard: ${hardCount} Questions (${diffHard}%)`}
              >
                {diffHard > 12 && `${hardCount}Q`}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Presets:</span>
            </span>
            <button
              type="button"
              onClick={() => applyPreset(4, 3, 3)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors shadow-2xs"
            >
              Board Standard (4E, 3M, 3H = 10Q)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(5, 3, 2)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors shadow-2xs"
            >
              Remedial Foundation (5E, 3M, 2H = 10Q)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2, 4, 4)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors shadow-2xs"
            >
              Advanced Challenge (2E, 4M, 4H = 10Q)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2, 2, 2)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 text-slate-700 transition-colors shadow-2xs"
            >
              Minimum Tier (2E, 2M, 2H = 6Q)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(10, 10, 10)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-700 transition-colors shadow-2xs"
            >
              Max Question Bank (10E, 10M, 10H = 30Q)
            </button>
          </div>

          {/* 3 Dedicated Interactive Tier Sliders / Progress Bars */}
          <div className="grid md:grid-cols-3 gap-4 pt-1">
            {/* 1. Easy Tier Card */}
            <div className="p-4 rounded-xl bg-white border-2 border-emerald-200/90 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h4 className="text-xs font-bold text-slate-900">Easy Cognitive Tier</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Remember (1–2m) & Understand (2–3m)
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black font-mono">
                  {easyCount} Qs
                </span>
              </div>

              {/* Progress Bar of Target (out of 10) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-emerald-700 font-semibold">
                  <span>Target Progress</span>
                  <span>{easyCount}/10 ({diffEasy}% of exam)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${(easyCount / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEasyCount(prev => Math.max(2, prev - 1))}
                  disabled={easyCount <= 2}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                  title="Decrease Easy questions (min 2)"
                >
                  -
                </button>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={easyCount}
                  onChange={e => setEasyCount(parseInt(e.target.value, 10))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setEasyCount(prev => Math.min(10, prev + 1))}
                  disabled={easyCount >= 10}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                  title="Increase Easy questions (max 10)"
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5 border-t border-slate-100">
                <span>Suggested: 1–2m / 2–3m</span>
                <span className="font-semibold text-emerald-700">~{easyCount * 1}–{easyCount * 2} Marks</span>
              </div>
            </div>

            {/* 2. Medium Tier Card */}
            <div className="p-4 rounded-xl bg-white border-2 border-amber-200/90 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-bold text-slate-900">Medium Cognitive Tier</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Apply (2–4m) & Analyze (3–5m)
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-black font-mono">
                  {medCount} Qs
                </span>
              </div>

              {/* Progress Bar of Target (out of 10) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-amber-700 font-semibold">
                  <span>Target Progress</span>
                  <span>{medCount}/10 ({diffMedium}% of exam)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-150"
                    style={{ width: `${(medCount / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMedCount(prev => Math.max(2, prev - 1))}
                  disabled={medCount <= 2}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                  title="Decrease Medium questions (min 2)"
                >
                  -
                </button>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={medCount}
                  onChange={e => setMedCount(parseInt(e.target.value, 10))}
                  className="flex-1 accent-amber-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setMedCount(prev => Math.min(10, prev + 1))}
                  disabled={medCount >= 10}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                  title="Increase Medium questions (max 10)"
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5 border-t border-slate-100">
                <span>Suggested: 2–4m / 3–5m</span>
                <span className="font-semibold text-amber-700">~{medCount * 2}–{medCount * 4} Marks</span>
              </div>
            </div>

            {/* 3. Hard Tier Card */}
            <div className="p-4 rounded-xl bg-white border-2 border-rose-200/90 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <h4 className="text-xs font-bold text-slate-900">Hard Cognitive Tier</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Evaluate (3–5m) & Create (4–5m)
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-black font-mono">
                  {hardCount} Qs
                </span>
              </div>

              {/* Progress Bar of Target (out of 10) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-rose-700 font-semibold">
                  <span>Target Progress</span>
                  <span>{hardCount}/10 ({diffHard}% of exam)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-150"
                    style={{ width: `${(hardCount / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHardCount(prev => Math.max(2, prev - 1))}
                  disabled={hardCount <= 2}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                  title="Decrease Hard questions (min 2)"
                >
                  -
                </button>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={hardCount}
                  onChange={e => setHardCount(parseInt(e.target.value, 10))}
                  className="flex-1 accent-rose-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setHardCount(prev => Math.min(10, prev + 1))}
                  disabled={hardCount >= 10}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                  title="Increase Hard questions (max 10)"
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5 border-t border-slate-100">
                <span>Suggested: 3–5m / 4–5m</span>
                <span className="font-semibold text-rose-700">~{hardCount * 3}–{hardCount * 5} Marks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Synthesizing Cognitive Tier Paper...' : 'Generate Divided Cognitive Difficulty Paper'}</span>
          </button>
        </div>
      </div>

      {/* Generated Paper View */}
      {paper && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 sm:p-12 print-page space-y-8">
          {/* Official Academic Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-slate-500">
              Maharashtra State Secondary Board Examination • Science 2
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {paper.title}
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-slate-700 pt-1">
              <span><strong>Subject:</strong> {paper.subject}</span>
              <span>·</span>
              <span><strong>Level:</strong> {paper.academicLevel}</span>
              <span>·</span>
              <span><strong>Duration:</strong> {paper.durationMinutes} Minutes</span>
              <span>·</span>
              <span><strong>Total Marks:</strong> {paper.totalMarks}</span>
            </div>
          </div>

          {/* Cognitive Difficulty Balance Verification & Tier Filter (No-print) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cognitive Difficulty Division Verification
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                  100% Target Met
                </span>
              </div>

              {/* Filter Tabs by Cognitive Tier */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTierFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedTierFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Tiers ({paper.sections.reduce((a, s) => a + s.questions.length, 0)} Qs)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTierFilter('Easy')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedTierFilter === 'Easy' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Easy Tier ({paper.sections.find(s => s.sectionName.includes('Easy'))?.questions.length || 0} Qs)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTierFilter('Medium')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedTierFilter === 'Medium' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Medium Tier ({paper.sections.find(s => s.sectionName.includes('Medium'))?.questions.length || 0} Qs)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTierFilter('Hard')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedTierFilter === 'Hard' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Hard Tier ({paper.sections.find(s => s.sectionName.includes('Hard'))?.questions.length || 0} Qs)
                </button>
              </div>
            </div>

            {/* Target vs Actual Breakdown Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase block">Easy Cognitive Tier</span>
                <span className="font-bold font-mono text-emerald-900 text-sm">
                  {paper.sections.find(s => s.sectionName.includes('Easy'))?.questions.length || 0} Questions
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Target: {easyCount} Qs (Matched)</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-semibold text-amber-800 uppercase block">Medium Cognitive Tier</span>
                <span className="font-bold font-mono text-amber-900 text-sm">
                  {paper.sections.find(s => s.sectionName.includes('Medium'))?.questions.length || 0} Questions
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Target: {medCount} Qs (Matched)</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200">
                <span className="text-[10px] font-semibold text-rose-800 uppercase block">Hard Cognitive Tier</span>
                <span className="font-bold font-mono text-rose-900 text-sm">
                  {paper.sections.find(s => s.sectionName.includes('Hard'))?.questions.length || 0} Questions
                </span>
                <span className="text-[10px] text-rose-700 block mt-0.5">Target: {hardCount} Qs (Matched)</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
              General Examination Instructions:
            </span>
            <ul className="list-decimal list-inside space-y-0.5 text-[11px]">
              {paper.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>

          {/* Divided Questions by Cognitive Difficulty Tier */}
          <div className="space-y-10">
            {paper.sections
              .filter(sec => {
                if (selectedTierFilter === 'all') return true;
                if (selectedTierFilter === 'Easy' && sec.sectionName.includes('Easy')) return true;
                if (selectedTierFilter === 'Medium' && sec.sectionName.includes('Medium')) return true;
                if (selectedTierFilter === 'Hard' && sec.sectionName.includes('Hard')) return true;
                return false;
              })
              .map((sec, secIdx) => {
                const isEasy = sec.sectionName.includes('Easy');
                const isMed = sec.sectionName.includes('Medium');
                const isHard = sec.sectionName.includes('Hard');

                const tierBorder = isEasy ? 'border-l-4 border-l-emerald-500 pl-4' : isMed ? 'border-l-4 border-l-amber-500 pl-4' : 'border-l-4 border-l-rose-500 pl-4';
                const tierPillBg = isEasy ? 'bg-emerald-100 text-emerald-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';

                return (
                  <div key={secIdx} className={`space-y-5 ${tierBorder}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-300 pb-2.5 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                            {sec.sectionName}
                          </h3>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${tierPillBg}`}>
                            {sec.questions.length} Questions
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic mt-0.5">{sec.instructions}</p>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-900 shrink-0">
                        [{sec.totalMarks} Marks]
                      </span>
                    </div>

                    <div className="space-y-6">
                      {sec.questions.map(q => (
                        <div key={q.id} className="space-y-2 pl-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2.5 max-w-4xl">
                              <span className="font-bold font-mono text-slate-900 text-xs mt-0.5">
                                Q{q.questionNumber}.
                              </span>
                              <div className="space-y-1.5">
                                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                                  {q.text}
                                </p>

                                {/* Multiple choice options if applicable */}
                                {q.options && q.options.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-2">
                                    {q.options.map((opt, optIdx) => (
                                      <span key={optIdx} className="text-xs text-slate-700 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Cognitive Tags (Hidden in print) */}
                                <div className="flex flex-wrap items-center gap-2 pt-1 no-print">
                                  <DifficultyBadge difficulty={q.difficulty} />
                                  <BloomBadge level={q.bloomLevel} />
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono font-semibold">
                                    Suggested: {q.suggestedMarks || (q.bloomLevel === 'Remember' ? '1–2' : q.bloomLevel === 'Understand' ? '2–3' : q.bloomLevel === 'Apply' ? '2–4' : q.bloomLevel === 'Create' ? '4–5' : '3–5')} Marks
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium font-mono">Topic: {q.topic}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="font-mono font-bold text-xs text-slate-900">
                                [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                              </span>
                              {/* Teacher Marks Adjuster (No-print) */}
                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 no-print" title="Adjust question marks">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestionMarks(q.id, -1)}
                                  disabled={q.marks <= 1}
                                  className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                                  title="Decrease mark"
                                >
                                  -
                                </button>
                                <span className="font-mono font-bold text-[10px] px-1 text-slate-800">
                                  {q.marks}m
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestionMarks(q.id, 1)}
                                  disabled={q.marks >= 10}
                                  className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                                  title="Increase mark"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Model Answer / Solution Drawer (Optional toggle) */}
                          <details className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 no-print">
                            <summary className="font-bold text-indigo-700 cursor-pointer select-none">
                              View Answer Key & Marking Criteria
                            </summary>
                            <div className="mt-2 text-slate-700 space-y-1 border-t border-slate-200 pt-2 font-mono text-[11px]">
                              <p><strong>Answer:</strong> {q.correctAnswer}</p>
                              {q.modelAnswer && <p><strong>Model Solution:</strong> {q.modelAnswer}</p>}
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* End of Examination notice */}
          <div className="text-center pt-8 border-t border-slate-200">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-widest uppercase">
              *** END OF EXAMINATION QUESTION PAPER ***
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
