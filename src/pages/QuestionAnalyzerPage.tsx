import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  SearchCode, 
  Upload, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  CheckCircle2,
  AlertTriangle, 
  AlertCircle,
  Layers, 
  Filter, 
  Search, 
  Edit3, 
  Save, 
  RefreshCw, 
  ArrowRight,
  Info,
  Sliders,
  Sparkles,
  UploadCloud,
  FileCheck,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  analyzeQuestionPaper, 
  fetchDocuments, 
  uploadDocument,
  AnalyzePaperResponse 
} from '../services/api';
import { 
  DocumentItem, 
  QuestionAnalysis, 
  PaperSummary, 
  DifficultyLevel, 
  BloomLevel,
  SyllabusTopicCoverage
} from '../types';
import { DifficultyBadge, BloomBadge } from '../components/common/Badges';

export const QuestionAnalyzerPage: React.FC = () => {
  const location = useLocation();
  const preselectedDocId = (location.state as any)?.preselectedDocId;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedDocId || 'doc_sci2_exam');
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('doc_sci2_syllabus');
  const [rawText, setRawText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'document' | 'rawText'>(
    preselectedDocId ? 'document' : 'upload'
  );

  // Direct upload states inside Analyzer
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditSuccessMessage, setAuditSuccessMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePaperResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionAnalysis[]>([]);
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [syllabusTopics, setSyllabusTopics] = useState<SyllabusTopicCoverage[]>([]);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterBloom, setFilterBloom] = useState<string>('all');

  // Editing single question inline
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments().then(docs => {
      setDocuments(docs);
      // Run initial analysis on Science 2 model paper or preselected paper
      const targetDoc = preselectedDocId || 'doc_sci2_exam';
      handleRunAnalysis(targetDoc, 'doc_sci2_syllabus');
    }).catch(() => {});
  }, [preselectedDocId]);

  const handleFileUploadAndAnalyze = async (fileToUpload: File) => {
    setAuditError(null);
    setAuditSuccessMessage(null);
    setLoading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('docType', 'question_paper');
      formData.append('customName', fileToUpload.name.replace(/\.[^/.]+$/, ''));
      formData.append('ownerRole', 'teacher');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 80 ? prev + 20 : prev));
      }, 150);

      const uploadedDoc = await uploadDocument(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to documents list and select
      setDocuments(prev => [uploadedDoc, ...prev]);
      setSelectedDocId(uploadedDoc.id);

      // Analyze newly uploaded document
      const res = await analyzeQuestionPaper({
        documentId: uploadedDoc.id,
        syllabusDocumentId: selectedSyllabusId || undefined,
      });

      setAnalysisResult(res);
      setQuestions(res.questions);
      setSummary(res.summary);
      setSyllabusTopics(res.syllabusTopics || []);
      setAuditSuccessMessage(`Successfully extracted and audited ${res.questions.length} clean, human-readable Science 2 questions from "${uploadedDoc.name}".`);
    } catch (err: any) {
      console.error('Audit failed:', err);
      setAuditError(err.message || 'Failed to upload and analyze document.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleRunAnalysis = async (docIdToUse?: string, syllabusIdToUse?: string) => {
    setAuditError(null);
    setAuditSuccessMessage(null);

    // If in upload mode and a file is selected:
    if (inputMode === 'upload') {
      if (selectedFile) {
        return handleFileUploadAndAnalyze(selectedFile);
      } else if (!docIdToUse) {
        setAuditError('Please select or drag a Science 2 question paper PDF to upload, or switch to "Choose Existing PDF".');
        fileInputRef.current?.click();
        return;
      }
    }

    setLoading(true);
    try {
      let payload: any;
      if (inputMode === 'rawText') {
        if (!rawText.trim()) {
          setAuditError('Please paste examination questions into the text box below or click "Load Science 2 Sample Questions".');
          setLoading(false);
          return;
        }
        payload = { rawQuestionsText: rawText, syllabusDocumentId: selectedSyllabusId || undefined };
      } else {
        const targetId = docIdToUse || selectedDocId;
        if (!targetId) {
          setAuditError('Please select a target examination document or upload a PDF above.');
          setLoading(false);
          return;
        }
        payload = {
          documentId: targetId,
          syllabusDocumentId: syllabusIdToUse !== undefined ? syllabusIdToUse : selectedSyllabusId || undefined,
        };
      }

      const res = await analyzeQuestionPaper(payload);
      setAnalysisResult(res);
      setQuestions(res.questions);
      setSummary(res.summary);
      setSyllabusTopics(res.syllabusTopics || []);
      setAuditSuccessMessage(`Audit complete: ${res.questions.length} questions evaluated across Bloom's Taxonomy and ML difficulty.`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAuditError(err.message || 'Failed to analyze question paper.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleQuestions = () => {
    setRawText(`1. Transfer of information from molecule of DNA to mRNA is called as _________ process. [1 mark]
2. Define vestigial organs and write names of any two vestigial organs in human body. [2 marks]
3. Explain the theory of natural selection given by Darwin and state the objections raised against it. [3 marks]
4. Identify correlation: Peripatus : Connecting link :: Appendix : _________. [1 mark]
5. Explain the nature and scope of disaster of flood with respect to pre-disaster and emergency phase. [4 marks]
6. Draw a neat labeled diagram of human male reproductive system and write functions of testes. [5 marks]
7. What is social health? Explain the factors disturbing social health. [3 marks]
8. Justify: Study of fossils is an important aspect of study of evolution. [3 marks]`);
    setAuditError(null);
  };

  const handleUpdateQuestion = (updated: QuestionAnalysis) => {
    setQuestions(prev => prev.map(q => q.id === updated.id ? { ...updated, isEdited: true } : q));
    setEditingQuestionId(null);

    // Recalculate summary metrics dynamically
    if (summary) {
      const updatedQuestions = questions.map(q => q.id === updated.id ? updated : q);
      const diffDist = { easy: 0, medium: 0, hard: 0 };
      const bloomDist: Record<BloomLevel, number> = {
        Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0,
      };
      let totalMarks = 0;
      updatedQuestions.forEach(q => {
        if (q.difficulty === 'Easy') diffDist.easy++;
        if (q.difficulty === 'Medium') diffDist.medium++;
        if (q.difficulty === 'Hard') diffDist.hard++;
        bloomDist[q.bloomLevel] = (bloomDist[q.bloomLevel] || 0) + 1;
        totalMarks += q.marks || 0;
      });
      setSummary({
        ...summary,
        totalMarks,
        difficultyDistribution: diffDist,
        bloomDistribution: bloomDist,
      });
    }
  };

  const exportAsJSON = () => {
    if (!analysisResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ summary, questions, syllabusTopics }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EduAI_Analysis_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    if (!questions.length) return;
    const headers = ['Number', 'Question Text', 'Marks', 'Difficulty', 'Bloom Level', 'Topic', 'Confidence'];
    const rows = questions.map(q => [
      q.number,
      `"${q.text.replace(/"/g, '""')}"`,
      q.marks,
      q.difficulty,
      q.bloomLevel,
      `"${q.topic}"`,
      `${Math.round(q.difficultyConfidence * 100)}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `EduAI_Questions_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesBloom = filterBloom === 'all' || q.bloomLevel === filterBloom;
    return matchesSearch && matchesDifficulty && matchesBloom;
  });

  const diffColors = {
    Easy: '#10b981',
    Medium: '#f59e0b',
    Hard: '#f43f5e',
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Question Paper Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predict question difficulty, evaluate Bloom’s Taxonomy levels, and audit syllabus coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportAsCSV}
            disabled={!questions.length}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportAsJSON}
            disabled={!questions.length}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* In-UI Error & Success Banners */}
      {auditError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Audit Request Notice</p>
              <p className="mt-0.5 leading-relaxed">{auditError}</p>
            </div>
          </div>
          <button
            onClick={() => setAuditError(null)}
            className="p-1 text-rose-400 hover:text-rose-700 rounded-lg shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {auditSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">{auditSuccessMessage}</p>
          </div>
          <button
            onClick={() => setAuditSuccessMessage(null)}
            className="p-1 text-emerald-400 hover:text-emerald-700 rounded-lg shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Selection Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Select Input Source to Audit</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setInputMode('upload');
                setAuditError(null);
              }}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                inputMode === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload PDF File</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('document');
                setAuditError(null);
              }}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                inputMode === 'document' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Choose Existing PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('rawText');
                setAuditError(null);
              }}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                inputMode === 'rawText' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Paste Questions</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Upload PDF File */}
        {inputMode === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setSelectedFile(file);
                  handleFileUploadAndAnalyze(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer relative ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    handleFileUploadAndAnalyze(file);
                  }
                }}
                accept=".pdf,.txt"
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop your Science 2 Question Paper PDF here'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Or click anywhere in this box to browse files from your computer (PDF or TXT up to 25MB)
                  </p>
                </div>

                {uploadProgress > 0 && (
                  <div className="pt-2 space-y-1.5 max-w-xs mx-auto">
                    <div className="flex justify-between text-[11px] font-semibold text-blue-700">
                      <span>Extracting text & parsing questions...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-blue-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference Syllabus (For Curriculum Match Calculation)
                </label>
                <select
                  value={selectedSyllabusId}
                  onChange={e => setSelectedSyllabusId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- No syllabus (Skip coverage calculation) --</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedFile) {
                      handleFileUploadAndAnalyze(selectedFile);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{selectedFile ? 'Re-Upload & Audit File' : 'Browse PDF File to Audit'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Choose Existing PDF */}
        {inputMode === 'document' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Examination Document
              </label>
              <select
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pageCount} pgs)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Selecting this document will load its full extracted question set.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference Syllabus (For Curriculum Coverage Audit)
              </label>
              <select
                value={selectedSyllabusId}
                onChange={e => setSelectedSyllabusId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- No syllabus (Skip coverage calculation) --</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Evaluates which Science 2 chapters and topics are covered.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Paste Questions Manually */}
        {inputMode === 'rawText' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Paste Numbered Questions
              </label>
              <button
                type="button"
                onClick={handleLoadSampleQuestions}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Science 2 Sample Questions</span>
              </button>
            </div>

            <textarea
              rows={7}
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                setAuditError(null);
              }}
              placeholder="1. Define vestigial organs and give two examples. [2 marks]&#10;2. Explain Darwin's theory of natural selection and objections against it. [3 marks]&#10;3. What is disaster management? Explain pre-disaster and emergency phases. [4 marks]"
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Syllabus Reference Document
              </label>
              <select
                value={selectedSyllabusId}
                onChange={e => setSelectedSyllabusId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="">-- No syllabus comparison --</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action Toolbar with Run Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {inputMode === 'upload' && 'Upload a PDF to parse questions & calculate cognitive balance immediately.'}
              {inputMode === 'document' && 'Evaluates the selected question paper against Random Forest & Bloom models.'}
              {inputMode === 'rawText' && 'Parses question numbers, action verbs, and marks to predict difficulty.'}
            </span>
          </span>

          <button
            type="button"
            onClick={() => handleRunAnalysis()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Cognitive & ML Audit...</span>
              </>
            ) : (
              <>
                <SearchCode className="w-4 h-4 text-white" />
                <span>Run Cognitive & ML Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Executive Summary Cards */}
      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Total Questions</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">{summary.totalQuestions}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Total Marks: {summary.totalMarks}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Difficulty Split</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-emerald-600">{summary.difficultyDistribution.easy} Easy</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold text-amber-600">{summary.difficultyDistribution.medium} Med</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold text-rose-600">{summary.difficultyDistribution.hard} Hard</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1.5">Random Forest Classifier</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Syllabus Coverage</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {summary.syllabusCoveragePercent !== undefined ? `${summary.syllabusCoveragePercent}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {summary.syllabusReferenceDoc ? 'Measured from Syllabus' : 'No syllabus provided'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Highest Bloom Level</span>
              <span className="text-xl font-black text-indigo-700 tracking-tight">
                {summary.bloomDistribution.Create > 0 ? 'Level 6 · Create' : summary.bloomDistribution.Evaluate > 0 ? 'Level 5 · Evaluate' : 'Level 4 · Analyze'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Cognitive Depth Reached</span>
            </div>
          </div>

          {/* Balance Suggestions & Warnings */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Assessment Quality & Balance Recommendations</span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                {summary.suggestions.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {summary.redundantQuestions && summary.redundantQuestions.length > 0 ? (
                  summary.redundantQuestions.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed"><strong>Overlap Detected:</strong> {r}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>No excessive redundancy or repetitive question topics detected.</p>
                  </div>
                )}

                {summary.coverageGaps && summary.coverageGaps.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p><strong>Unassessed Syllabus Topics:</strong> {summary.coverageGaps.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions Interactive Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Detected Questions & Cognitive Classifications</h2>
            <p className="text-xs text-slate-500">Click any row or edit button to adjust marks, difficulty, or Bloom levels.</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter questions or topic..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={filterBloom}
              onChange={e => setFilterBloom(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Bloom Levels</option>
              <option value="Remember">Remember</option>
              <option value="Understand">Understand</option>
              <option value="Apply">Apply</option>
              <option value="Analyze">Analyze</option>
              <option value="Evaluate">Evaluate</option>
              <option value="Create">Create</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">Question Text</th>
                <th className="py-3 px-3">Marks</th>
                <th className="py-3 px-3">Predicted Difficulty</th>
                <th className="py-3 px-3">Bloom's Level</th>
                <th className="py-3 px-3">Identified Topic</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No questions found matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map(q => (
                  <React.Fragment key={q.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700 font-mono">
                        {q.number}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-800 font-normal leading-relaxed">{q.text}</p>
                        {q.bloomReason && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            {q.bloomReason}
                          </p>
                        )}
                        {q.isEdited && (
                          <span className="text-[10px] text-blue-700 font-semibold block mt-1">
                            (Modified by Teacher)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {q.marks || 5}m
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <DifficultyBadge difficulty={q.difficulty} />
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <BloomBadge level={q.bloomLevel} hideNumber />
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {q.topic}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{editingQuestionId === q.id ? 'Close' : 'Edit'}</span>
                        </button>
                      </td>
                    </tr>

                    {/* Inline edit drawer */}
                    {editingQuestionId === q.id && (
                      <tr className="bg-blue-50/40">
                        <td colSpan={7} className="p-4 border-b border-blue-100">
                          <div className="space-y-3 max-w-3xl bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
                            <span className="text-xs font-bold text-blue-900 block">
                              Edit Question #{q.number} Classification & Marks
                            </span>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Question Text
                              </label>
                              <textarea
                                rows={2}
                                defaultValue={q.text}
                                id={`edit_text_${q.id}`}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Difficulty
                                </label>
                                <select
                                  id={`edit_diff_${q.id}`}
                                  defaultValue={q.difficulty}
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                                >
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Hard">Hard</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Bloom's Taxonomy
                                </label>
                                <select
                                  id={`edit_bloom_${q.id}`}
                                  defaultValue={q.bloomLevel}
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                                >
                                  <option value="Remember">Remember</option>
                                  <option value="Understand">Understand</option>
                                  <option value="Apply">Apply</option>
                                  <option value="Analyze">Analyze</option>
                                  <option value="Evaluate">Evaluate</option>
                                  <option value="Create">Create</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Marks
                                </label>
                                <input
                                  type="number"
                                  id={`edit_marks_${q.id}`}
                                  defaultValue={q.marks || 5}
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const newText = (document.getElementById(`edit_text_${q.id}`) as HTMLTextAreaElement)?.value || q.text;
                                  const newDiff = (document.getElementById(`edit_diff_${q.id}`) as HTMLSelectElement)?.value as DifficultyLevel || q.difficulty;
                                  const newBloom = (document.getElementById(`edit_bloom_${q.id}`) as HTMLSelectElement)?.value as BloomLevel || q.bloomLevel;
                                  const newMarks = parseInt((document.getElementById(`edit_marks_${q.id}`) as HTMLInputElement)?.value || '5', 10);
                                  handleUpdateQuestion({
                                    ...q,
                                    text: newText,
                                    difficulty: newDiff,
                                    bloomLevel: newBloom,
                                    marks: newMarks,
                                  });
                                }}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
