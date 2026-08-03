'use client';

import React, { useState, useEffect } from 'react';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { AnalyticsCharts } from '@/components/dashboard/Charts';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { LinkGeneratorModal } from '@/components/forms/LinkGeneratorModal';
import { StatusTimelineModal } from '@/components/dashboard/StatusTimelineModal';
import { Plus, Award, ArrowUpRight, FileSpreadsheet, FileText, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, regRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/registrations'),
      ]);

      const statsData = await statsRes.json();
      const regData = await regRes.json();

      if (statsRes.ok) setStats(statsData);
      if (regRes.ok) setRecentRegistrations((regData.registrations || []).slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              CRM Comercial
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Panel de Control General</h1>
          <p className="text-xs text-slate-400">
            Métricas de captación, desempeño comercial y conversiones en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Generar Nuevo Enlace
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats?.kpis ? (
        <KpiCards kpis={stats.kpis} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      )}

      {/* Analytics Charts */}
      {stats?.funnel && stats?.byProgram && (
        <AnalyticsCharts funnelData={stats.funnel} byProgramData={stats.byProgram} />
      )}

      {/* Top Advisors & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Advisors Ranking (Admin view) */}
        {stats?.topAdvisors && stats.topAdvisors.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Top Asesores de Ventas
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Captación</span>
            </div>

            <div className="space-y-3">
              {stats.topAdvisors.map((adv: any, idx: number) => (
                <div
                  key={adv.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : 'bg-amber-800 text-amber-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{adv.name}</p>
                      <p className="text-[11px] text-slate-400">{adv.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-blue-400">{adv.totalLeads} leads</span>
                    <p className="text-[10px] text-emerald-400 font-semibold">{adv.matriculados} matriculados</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Registrations Table Preview */}
        <div
          className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 ${
            stats?.topAdvisors && stats.topAdvisors.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Últimas Inscripciones Recibidas</h3>
              <p className="text-xs text-slate-400">Leads captados recientemente a través de los enlaces</p>
            </div>
            <Link
              href="/registrations"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Ver Todas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/40">
                <tr>
                  <th className="p-3 font-semibold">Fecha</th>
                  <th className="p-3 font-semibold">Estudiante</th>
                  <th className="p-3 font-semibold">Programa</th>
                  <th className="p-3 font-semibold">Asesor</th>
                  <th className="p-3 font-semibold">Estado</th>
                  <th className="p-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {recentRegistrations.length > 0 ? (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-white">{reg.fullName}</p>
                        <p className="text-[10px] text-slate-400">{reg.email}</p>
                      </td>
                      <td className="p-3 text-slate-300">{reg.program?.name}</td>
                      <td className="p-3 text-slate-400">{reg.advisor?.name}</td>
                      <td className="p-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedRegistration(reg)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-bold border border-blue-500/30 transition-colors"
                        >
                          Ver Expediente
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                      No hay registros recientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LinkGeneratorModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onLinkCreated={fetchDashboardData}
      />

      <StatusTimelineModal
        isOpen={!!selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        registration={selectedRegistration}
        onStatusUpdated={() => {
          setSelectedRegistration(null);
          fetchDashboardData();
        }}
      />
    </div>
  );
}
