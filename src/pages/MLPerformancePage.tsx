import React, { useEffect, useState } from 'react';
import { 
  Binary, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  BookOpen, 
  Info,
  HelpCircle,
  Play
} from 'lucide-react';
import { fetchMLMetrics, predictDifficulty } from '../services/api';
import { MLModelMetrics } from '../types';
import { DifficultyBadge } from '../components/common/Badges';

export const MLPerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<{
    benchmark128Paper: MLModelMetrics;
    randomForest: MLModelMetrics;
    svm: MLModelMetrics;
  } | null>(null);

  const [testText, setTestText] = useState(
    'Transfer of information from molecule of DNA to mRNA is called as transcription process.'
  );
  const [prediction, setPrediction] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetchMLMetrics().then(setMetrics).catch(() => {});
    handlePredict(testText);
  }, []);

  const handlePredict = async (text: string) => {
    if (!text.trim()) return;
    setPredicting(true);
    try {
      const res = await predictDifficulty(text);
      setPrediction(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Machine Learning Difficulty Classification Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empirical research validation benchmarks, feature extraction pipelines, and model evaluation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            <span>Random Forest vs SVM</span>
          </span>
        </div>
      </div>

      {/* Reported Research Benchmark Spotlight Banner (Section 7 Requirement) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/30 text-blue-300 text-[11px] font-mono font-semibold">
              RESEARCH STUDY BENCHMARK
            </span>
            <span className="text-xs text-slate-300">Published Empirical Dataset</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Held-Out Validation Accuracy: 88.46%
          </span>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block">Dataset Sample</span>
            <span className="text-xl font-bold text-white tracking-tight">128 Questions</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Faculty Labeled Ground-Truth</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block">Precision</span>
            <span className="text-xl font-bold text-white tracking-tight">89.12%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Macro-averaged</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block">Recall</span>
            <span className="text-xl font-bold text-white tracking-tight">88.46%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Sensitivity</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block">F1-Score</span>
            <span className="text-xl font-bold text-white tracking-tight">88.75%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Harmonic Mean</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/10 text-xs text-slate-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Methodology Note:</strong> The supplied research presentation reports <strong>88.46% held-out validation accuracy</strong> for its Random Forest model on a dataset of 128 questions. In compliance with strict experimental guidelines, this reported historical benchmark is tracked separately from newly evaluated test datasets.
          </p>
        </div>
      </div>

      {/* Live Single-Question Predictor Sandbox */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Interactive Model Inference Sandbox</h2>
            <p className="text-xs text-slate-500">
              Type or paste any examination question to inspect live linguistic feature vectorization and difficulty output.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">scikit-learn pipeline</span>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={testText}
            onChange={e => setTestText(e.target.value)}
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Type question here..."
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const sample = 'Transfer of information from molecule of DNA to mRNA is called as transcription process.';
                  setTestText(sample);
                  handlePredict(sample);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Sample 1 (Easy)
              </button>
              <button
                onClick={() => {
                  const sample = 'Geographical and reproductive isolation of organisms gradually leads to speciation. Justify same with suitable examples.';
                  setTestText(sample);
                  handlePredict(sample);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Sample 2 (Medium)
              </button>
              <button
                onClick={() => {
                  const sample = 'Explain the nature and scope of the disaster of flood with the help of six points: pre-disaster, warning, emergency, rehabilitation, recovery, and reconstruction.';
                  setTestText(sample);
                  handlePredict(sample);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Sample 3 (Hard)
              </button>
            </div>

            <button
              onClick={() => handlePredict(testText)}
              disabled={predicting || !testText.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{predicting ? 'Evaluating...' : 'Run Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Results Display */}
        {prediction && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Predicted Class</span>
              <div className="mt-1">
                <DifficultyBadge difficulty={prediction.difficulty} showConfidence={prediction.confidence} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Token Word Count</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {prediction.features.wordCount} words
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Cognitive Verb Score</span>
              <span className="text-base font-bold text-indigo-700 mt-1 block">
                {prediction.features.cognitiveScore} pts
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Formula / Symbols</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {prediction.features.hasComplexFormula ? 'Yes (Detected)' : 'No (Text-only)'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Punctuation Density</span>
              <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
                {prediction.features.punctuationDensity}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Model Comparisons & Confusion Matrix */}
      {metrics && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Random Forest Model */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{metrics.randomForest.modelName}</h3>
                <p className="text-xs text-slate-500">100 Trees Ensemble with Gini Impurity criterion</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs">
                {metrics.randomForest.validationAccuracy}% Val Acc
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                3x3 Confusion Matrix (Easy / Medium / Hard)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                    <tr>
                      <th className="p-2 text-left">Actual \ Pred</th>
                      <th className="p-2">Easy</th>
                      <th className="p-2">Medium</th>
                      <th className="p-2">Hard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.randomForest.confusionMatrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-left font-bold text-slate-700">
                          {metrics.randomForest.classes[rIdx]}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-2 font-bold ${
                              rIdx === cIdx ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">Top Feature Importances</span>
              {metrics.randomForest.topFeatures.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>{f.feature}</span>
                    <span className="font-mono">{Math.round(f.importance * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${f.importance * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Vector Machine (SVM) Comparison */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{metrics.svm.modelName}</h3>
                <p className="text-xs text-slate-500">Linear / RBF kernel support vector comparison</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                {metrics.svm.validationAccuracy}% Val Acc
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                3x3 Confusion Matrix (Easy / Medium / Hard)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                    <tr>
                      <th className="p-2 text-left">Actual \ Pred</th>
                      <th className="p-2">Easy</th>
                      <th className="p-2">Medium</th>
                      <th className="p-2">Hard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.svm.confusionMatrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-left font-bold text-slate-700">
                          {metrics.svm.classes[rIdx]}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-2 font-bold ${
                              rIdx === cIdx ? 'bg-blue-50 text-blue-800' : 'text-slate-500'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 block">Ensemble Recommendation:</span>
              <p className="leading-relaxed">
                The Random Forest classifier exhibits lower variance on out-of-vocabulary technical terms due to its decision boundary partitioning over combined syntactic ratios and cognitive verb tiers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
