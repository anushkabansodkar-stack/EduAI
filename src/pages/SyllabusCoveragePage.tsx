import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  SearchCode, 
  FileText, 
  Info, 
  RefreshCw,
  Edit3,
  Check
} from 'lucide-react';
import { fetchDocuments, analyzeQuestionPaper } from '../services/api';
import { DocumentItem, SyllabusTopicCoverage } from '../types';

export const SyllabusCoveragePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState('doc_sci2_exam');
  const [selectedSyllabusId, setSelectedSyllabusId] = useState('doc_sci2_syllabus');
  const [loading, setLoading] = useState(false);
  const [coveragePercent, setCoveragePercent] = useState<number>(88);
  const [topics, setTopics] = useState<SyllabusTopicCoverage[]>([
    {
      topic: 'Evidences of Evolution (Morphological, Anatomical, Vestigial, Palaeontological, Connecting Links)',
      syllabusImportance: 'Core',
      paperQuestionsCount: 4,
      paperMarksAllocated: 9,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#4', '#8', '#9', '#11'],
    },
    {
      topic: 'Protein Synthesis (Central Dogma, Transcription, Translation, Translocation)',
      syllabusImportance: 'Core',
      paperQuestionsCount: 3,
      paperMarksAllocated: 8,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#1', '#3', '#15'],
    },
    {
      topic: 'Theories of Evolution (Darwinian Natural Selection, Lamarckism, Speciation)',
      syllabusImportance: 'Core',
      paperQuestionsCount: 3,
      paperMarksAllocated: 7,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#5', '#7', '#10'],
    },
    {
      topic: 'Types of Disasters (Geological, Climatic, Accidental & Industrial, Gas Leakage)',
      syllabusImportance: 'Core',
      paperQuestionsCount: 2,
      paperMarksAllocated: 8,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#13', '#17'],
    },
    {
      topic: 'Disaster Management Cycle & Mitigation (Pre-disaster, Mock Drills, Rehabilitation)',
      syllabusImportance: 'Major',
      paperQuestionsCount: 1,
      paperMarksAllocated: 3,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#12'],
    },
    {
      topic: 'Human Reproductive System (Testes, Gametogenesis, Duct System, Accessory Glands)',
      syllabusImportance: 'Core',
      paperQuestionsCount: 1,
      paperMarksAllocated: 5,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#16'],
    },
    {
      topic: 'Solar Energy & Green Electricity Generation (Thermal vs Solar Thermal)',
      syllabusImportance: 'Major',
      paperQuestionsCount: 1,
      paperMarksAllocated: 5,
      coverageStatus: 'Adequate',
      identifiedQuestions: ['#18'],
    },
    {
      topic: 'Social Health, Addiction & Stress Management',
      syllabusImportance: 'Major',
      paperQuestionsCount: 1,
      paperMarksAllocated: 3,
      coverageStatus: 'Low Representation',
      identifiedQuestions: ['#14'],
    },
    {
      topic: 'Biodiversity Conservation & Environmental Projects',
      syllabusImportance: 'Supplementary',
      paperQuestionsCount: 0,
      paperMarksAllocated: 0,
      coverageStatus: 'Not Detected',
      identifiedQuestions: [],
    },
  ]);

  useEffect(() => {
    fetchDocuments().then(docs => {
      setDocuments(docs);
    }).catch(() => {});
  }, []);

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await analyzeQuestionPaper({
        documentId: selectedPaperId,
        syllabusDocumentId: selectedSyllabusId,
      });
      if (res.syllabusTopics && res.syllabusTopics.length > 0) {
        setTopics(res.syllabusTopics);
      }
      if (res.summary.syllabusCoveragePercent !== undefined) {
        setCoveragePercent(res.summary.syllabusCoveragePercent);
      }
    } catch (err: any) {
      alert('Syllabus audit error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (index: number, newStatus: 'Adequate' | 'Low Representation' | 'Not Detected') => {
    const updated = [...topics];
    updated[index].coverageStatus = newStatus;
    setTopics(updated);

    const adequateCount = updated.filter(t => t.coverageStatus !== 'Not Detected').length;
    setCoveragePercent(Math.round((adequateCount / updated.length) * 100));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Syllabus Coverage & Curriculum Alignment Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare question paper coverage against official course units to eliminate examination blindspots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            Curriculum Match: {coveragePercent}%
          </span>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Examination Paper
            </label>
            <select
              value={selectedPaperId}
              onChange={e => setSelectedPaperId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              {documents.filter(d => d.docType === 'question_paper').map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Course Syllabus PDF
            </label>
            <select
              value={selectedSyllabusId}
              onChange={e => setSelectedSyllabusId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              {documents.filter(d => d.docType === 'syllabus').map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Calculates representation based on Unit keyword matching and question allocation weights.</span>
          </span>
          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            <span>{loading ? 'Comparing Units...' : 'Recalculate Alignment'}</span>
          </button>
        </div>
      </div>

      {/* Coverage Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Adequately Covered</span>
            <span className="text-xl font-black text-slate-900">
              {topics.filter(t => t.coverageStatus === 'Adequate').length} Topics
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Low Representation</span>
            <span className="text-xl font-black text-slate-900">
              {topics.filter(t => t.coverageStatus === 'Low Representation').length} Topic
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Not Detected (Gaps)</span>
            <span className="text-xl font-black text-slate-900">
              {topics.filter(t => t.coverageStatus === 'Not Detected').length} Topic
            </span>
          </div>
        </div>
      </div>

      {/* Topics Breakdown Table with Teacher Override */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Syllabus Topic Coverage Breakdown</h2>
            <p className="text-xs text-slate-500">Teachers can review and manually adjust topic coverage status if needed.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Syllabus Topic / Learning Unit</th>
                <th className="py-3 px-3">Curriculum Tier</th>
                <th className="py-3 px-3">Question Count</th>
                <th className="py-3 px-3">Marks Allocated</th>
                <th className="py-3 px-3">Identified Questions</th>
                <th className="py-3 px-3 text-right">Coverage Status & Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topics.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-sm">
                    {t.topic}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-[11px] font-mono font-medium text-slate-600">
                      {t.syllabusImportance}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-900 font-bold">
                    {t.paperQuestionsCount}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-900 font-bold">
                    {t.paperMarksAllocated}m
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                    {t.identifiedQuestions.length > 0 ? t.identifiedQuestions.join(', ') : 'None'}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <select
                      value={t.coverageStatus}
                      onChange={e => handleUpdateStatus(idx, e.target.value as any)}
                      className={`text-xs py-1 px-2.5 rounded-lg border font-semibold ${
                        t.coverageStatus === 'Adequate'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : t.coverageStatus === 'Low Representation'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <option value="Adequate">Adequate</option>
                      <option value="Low Representation">Low Representation</option>
                      <option value="Not Detected">Not Detected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
