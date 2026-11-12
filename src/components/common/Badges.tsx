import React from 'react';
import { DifficultyLevel, BloomLevel } from '../../types';

export const DifficultyBadge: React.FC<{ difficulty: DifficultyLevel; showConfidence?: number }> = ({
  difficulty,
  showConfidence,
}) => {
  const config = {
    Easy: {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
    Medium: {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    Hard: {
      text: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      dot: 'bg-rose-500',
    },
  }[difficulty] || {
    text: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{difficulty}</span>
      {typeof showConfidence === 'number' && (
        <span className="opacity-75 text-[10px] font-mono">({Math.round(showConfidence * 100)}%)</span>
      )}
    </span>
  );
};

export const BloomBadge: React.FC<{ level: BloomLevel; showConfidence?: number; hideNumber?: boolean }> = ({
  level,
  showConfidence,
  hideNumber,
}) => {
  const config: Record<BloomLevel, { label: string; bg: string; text: string; border: string }> = {
    Remember: {
      label: hideNumber ? 'Remember' : '1 · Remember',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    Understand: {
      label: hideNumber ? 'Understand' : '2 · Understand',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
    },
    Apply: {
      label: hideNumber ? 'Apply' : '3 · Apply',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
    },
    Analyze: {
      label: hideNumber ? 'Analyze' : '4 · Analyze',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    Evaluate: {
      label: hideNumber ? 'Evaluate' : '5 · Evaluate',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    Create: {
      label: hideNumber ? 'Create' : '6 · Create',
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-700',
      border: 'border-fuchsia-200',
    },
  };

  const current = config[level] || {
    label: level,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${current.bg} ${current.text} ${current.border}`}
      title={`Bloom's Taxonomy Level: ${level}`}
    >
      <span>{current.label}</span>
      {typeof showConfidence === 'number' && (
        <span className="opacity-70 text-[10px] font-normal font-mono">· {Math.round(showConfidence * 100)}%</span>
      )}
    </span>
  );
};
