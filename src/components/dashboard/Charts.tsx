'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

interface ChartsProps {
  funnelData: Array<{ status: string; count: number; fill: string }>;
  byProgramData: Array<{ programName: string; count: number }>;
}

export function AnalyticsCharts({ funnelData, byProgramData }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conversion Funnel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Embudo de Conversión</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribución de registros por etapa del pipeline comercial
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={11} width={110} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registrations by Program */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Registros por Programa</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Programas con mayor demanda e inscritos
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byProgramData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="programName"
                stroke="#94a3b8"
                fontSize={10}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#0c8ee9" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
