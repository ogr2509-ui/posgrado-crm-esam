'use client';

import React from 'react';

export type StatusType =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'DOC_PENDIENTE'
  | 'COMPLETO'
  | 'MATRICULADO'
  | 'DESCARTADO';

interface StatusBadgeProps {
  status: StatusType | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; dot: string; border: string }
  > = {
    NUEVO: {
      label: 'Nuevo',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-800',
    },
    CONTACTADO: {
      label: 'Contactado',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    DOC_PENDIENTE: {
      label: 'Doc. Pendiente',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800',
    },
    COMPLETO: {
      label: 'Inscripción Completa',
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
      text: 'text-cyan-700 dark:text-cyan-300',
      dot: 'bg-cyan-500',
      border: 'border-cyan-200 dark:border-cyan-800',
    },
    MATRICULADO: {
      label: 'Matriculado',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    DESCARTADO: {
      label: 'Descartado',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800',
    },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500',
    border: 'border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
