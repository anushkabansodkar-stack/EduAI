import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search,
  Filter,
  FileCheck,
  X,
  FilePlus,
  BookOpen,
  SearchCode,
  Sparkles,
  Download,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchDocuments, uploadDocument, processDocument, deleteDocument, fetchDocumentById } from '../services/api';
import { DocumentItem } from '../types';

export const DocumentManagerPage: React.FC = () => {
  const { user, role } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);
  const [previewFullText, setPreviewFullText] = useState<string>('');
  const [loadingPreviewText, setLoadingPreviewText] = useState(false);

  // Form states for modal/inline upload
  const [docType, setDocType] = useState<'question_paper' | 'syllabus' | 'study_material'>('question_paper');
  const [customName, setCustomName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteTextMode, setPasteTextMode] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt')) {
      setUploadError('Only PDF and TXT documents are supported.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25MB maximum limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      if (customName.trim()) {
        formData.append('customName', customName.trim());
      }
      formData.append('ownerRole', role);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 85 ? prev + 15 : prev));
      }, 150);

      const uploaded = await uploadDocument(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCustomName('');
        setDocuments(prev => [uploaded, ...prev]);
      }, 400);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  const handlePastedUpload = async () => {
    if (!pastedContent.trim()) {
      setUploadError('Please enter text content.');
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(40);

    try {
      const formData = new FormData();
      formData.append('rawText', pastedContent);
      formData.append('docType', docType);
      formData.append('customName', customName || 'Pasted Syllabus / Examination');
      formData.append('ownerRole', role);

      const uploaded = await uploadDocument(formData);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setPastedContent('');
        setCustomName('');
        setPasteTextMode(false);
        setDocuments(prev => [uploaded, ...prev]);
      }, 300);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      await processDocument(docId);
      loadDocs();
    } catch (err: any) {
      alert('Failed to re-index document: ' + err.message);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document from the vector index?')) return;
    try {
      await deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (selectedDocForPreview?.id === docId) {
        setSelectedDocForPreview(null);
      }
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.originalFileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || d.docType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload PDF question papers, syllabus guides, and lecture notes for vector RAG indexing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPasteTextMode(!pasteTextMode)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              pasteTextMode
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>{pasteTextMode ? 'PDF Upload Mode' : 'Paste Text Mode'}</span>
          </button>
        </div>
      </div>

      {/* Official Science 2 Board PDF Downloads */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                Official Examination Documents
              </span>
              <span className="text-xs text-slate-300">• State Board SSC 2026</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Science 2 Official Curriculum & Examination PDFs
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Authentic vector-rendered PDF documents formatted with Section A-D board marking schemes, 22-topic syllabus unit breakdown, and master solved exemplar model answers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Doc 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  5 Pages
                </span>
                <span className="text-[10px] font-mono text-slate-300">40 Marks Paper</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
                1. Board Model Examination & Question Bank
              </h3>
              <p className="text-[11px] text-slate-300 mb-4 line-clamp-3">
                Complete 5-page board model question paper with Section A (Objectives), Section B (2-mark reasons), Section C (3-mark speciation/disasters), Section D (5-mark central dogma), and answers.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <a
                href="/api/documents/doc_sci2_exam/download-pdf"
                download="Science2_Board_Model_Examination_Question_Bank_5_Pages.pdf"
                className="flex-1 py-2 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
              <a
                href="/pdfs/Science2_Board_Model_Examination_Question_Bank.pdf"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="View in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Doc 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  8 Pages
                </span>
                <span className="text-[10px] font-mono text-slate-300">All 10 Chapters</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
                2. State Board Curriculum Syllabus & Chapter Learning Units
              </h3>
              <p className="text-[11px] text-slate-300 mb-4 line-clamp-3">
                Detailed 8-page curriculum architecture covering all 10 Science 2 chapters, competencies, practical evaluation rubrics, question weightage blueprint, and 22 core syllabus topics.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <a
                href="/api/documents/doc_sci2_syllabus/download-pdf"
                download="Science2_State_Board_Curriculum_Syllabus_8_Pages.pdf"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
              <a
                href="/pdfs/Science2_Curriculum_Syllabus_Chapter_Units.pdf"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="View in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Doc 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-400/20 text-violet-300 border border-violet-400/30">
                  16 Pages
                </span>
                <span className="text-[10px] font-mono text-slate-300">Master Compendium</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
                3. Master Study Guide & Solved Exemplars
              </h3>
              <p className="text-[11px] text-slate-300 mb-4 line-clamp-3">
                Comprehensive 16-page master guide with Central Dogma, Darwinism vs Lamarckism, connecting links, disaster mitigation cycles, comparative tables, and 5 full exemplar answer keys.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <a
                href="/api/documents/doc_sci2_notes/download-pdf"
                download="Science2_Master_Study_Guide_Solved_Exemplars_16_Pages.pdf"
                className="flex-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
              <a
                href="/pdfs/Science2_Master_Study_Guide_Solved_Exemplars.pdf"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="View in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      {!pasteTextMode ? (
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
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer relative ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/70'
              : 'border-slate-300 bg-slate-50/40 hover:bg-slate-50 hover:border-blue-400'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.txt"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-base font-bold text-slate-800">
                Drag and drop your Science 2 PDF here, or browse files
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports Question Papers, Syllabus Guides, and Study Material up to 25MB.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Browse &amp; Upload PDF</span>
              </button>
            </div>

            {/* Document metadata pre-selection */}
            <div 
              onClick={e => e.stopPropagation()} 
              className="grid grid-cols-2 gap-3 text-left pt-2 max-w-sm mx-auto cursor-default"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="question_paper">Question Paper</option>
                  <option value="syllabus">Curriculum / Syllabus</option>
                  <option value="study_material">Lecture / Study Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Midterm 2026"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {isUploading && (
              <div className="pt-4 space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between text-xs font-semibold text-blue-700">
                  <span>Extracting & Vectorizing Chunks...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Paste text manual input */
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Direct Paste Document / Syllabus</h2>
            <button
              onClick={() => setPasteTextMode(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g., Advanced Calculus Exam Q1-Q10"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="question_paper">Question Paper</option>
                <option value="syllabus">Syllabus / Course Outline</option>
                <option value="study_material">Study Material / Reference</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Raw Text Content
            </label>
            <textarea
              rows={8}
              placeholder="Paste exam questions, lecture content, or syllabus text here..."
              value={pastedContent}
              onChange={e => setPastedContent(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isUploading || !pastedContent.trim()}
              onClick={handlePastedUpload}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all"
            >
              {isUploading ? 'Vectorizing...' : 'Process & Index Content'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto">
          {['all', 'question_paper', 'syllabus', 'study_material'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'all' ? 'All Files' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Size & Pages</th>
                <th className="py-3 px-4">Vector Status</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No documents found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{doc.name}</p>
                          <p className="text-[10px] text-slate-600 font-mono">{doc.originalFileName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-slate-700">
                        {doc.docType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {Math.round(doc.sizeBytes / 1024)} KB · {doc.pageCount} pgs
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Indexed ({doc.chunksCount} chunks)</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/analyzer"
                          state={{ preselectedDocId: doc.id }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Run Cognitive & ML Audit on this paper"
                        >
                          <SearchCode className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </Link>
                        <Link
                          to="/question-generator"
                          state={{ referenceDocId: doc.id }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Generate questions from this PDF"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate</span>
                        </Link>
                        <a
                          href={`/api/documents/${doc.id}/download-pdf`}
                          download={`${doc.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={async () => {
                            setSelectedDocForPreview(doc);
                            setLoadingPreviewText(true);
                            try {
                              const full = await fetchDocumentById(doc.id);
                              setPreviewFullText(full.rawText || doc.previewSnippet || '');
                            } catch {
                              setPreviewFullText(doc.previewSnippet || '');
                            } finally {
                              setLoadingPreviewText(false);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Preview Extracted Text"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReprocess(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Re-index Chunks"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snippet & Vector Chunk Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDocForPreview.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedDocForPreview.chunksCount} chunks extracted for semantic retrieval &amp; AI analysis
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono bg-slate-50/50">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    Full Extracted Document Text (Verbatim)
                  </span>
                  {loadingPreviewText && (
                    <span className="text-[10px] text-blue-600 flex items-center gap-1 font-sans">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Loading full text...</span>
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                    {previewFullText || selectedDocForPreview.previewSnippet}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  RAG Embedding Metadata
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Document ID: <span className="text-slate-900 font-bold">{selectedDocForPreview.id}</span></div>
                  <div>Estimated Pages: <span className="text-slate-900 font-bold">{selectedDocForPreview.pageCount}</span></div>
                  <div>Vector Model: <span className="text-slate-900 font-bold">Semantic Embedding &amp; TF-IDF</span></div>
                  <div>Access Permission: <span className="text-slate-900 font-bold capitalize">{selectedDocForPreview.ownerRole} &amp; Enrolled Students</span></div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  to="/analyzer"
                  state={{ preselectedDocId: selectedDocForPreview.id }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                >
                  <SearchCode className="w-3.5 h-3.5" />
                  <span>Audit in Analyzer</span>
                </Link>
                <Link
                  to="/question-generator"
                  state={{ referenceDocId: selectedDocForPreview.id }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Exam</span>
                </Link>
              </div>

              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
