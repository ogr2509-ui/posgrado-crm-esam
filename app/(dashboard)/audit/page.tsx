'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, RefreshCw, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: 'bg-blue-950 text-blue-300 border-blue-800',
  USER_CREATED: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  USER_UPDATED: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  USER_DELETED: 'bg-rose-950 text-rose-300 border-rose-800',
  USER_DEACTIVATED: 'bg-amber-950 text-amber-300 border-amber-800',
  LINK_CREATED: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  STATUS_UPDATED: 'bg-purple-950 text-purple-300 border-purple-800',
  PROGRAM_CREATED: 'bg-teal-950 text-teal-300 border-teal-800',
  PROGRAM_UPDATED: 'bg-teal-950 text-teal-300 border-teal-800',
  PROGRAM_DELETED: 'bg-rose-950 text-rose-300 border-rose-800',
  EXPORT_EXCEL: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  EXPORT_PDF: 'bg-rose-950 text-rose-300 border-rose-800',
  PUBLIC_STUDENT_REGISTRATION: 'bg-blue-950 text-blue-300 border-blue-800',
  REGISTRATION_DELETED: 'bg-rose-950 text-rose-300 border-rose-800',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchAuditLogs = useCallback(async (opts?: { search?: string; action?: string; page?: number }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const s = opts?.search ?? search;
      const a = opts?.action ?? actionFilter;
      const p = opts?.page ?? page;

      if (s) params.set('search', s);
      if (a !== 'ALL') params.set('action', a);
      params.set('skip', String((p - 1) * PAGE_SIZE));
      params.set('take', String(PAGE_SIZE));

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.total ?? 0);
        if (data.availableActions) setAvailableActions(data.availableActions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [search, actionFilter, page]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleApplyFilters = () => {
    setPage(1);
    fetchAuditLogs({ search, action: actionFilter, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchAuditLogs({ page: newPage });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold text-[10px] uppercase border border-purple-500/20">
            Trazabilidad del Sistema
          </span>
          <h1 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" /> Registro de Auditoría & Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Trazabilidad completa de inicios de sesión, cambios de estado, generación de enlaces y exportaciones.
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs()}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Actualizar logs"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              placeholder="Buscar por usuario, acción o detalles..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-medium min-w-[200px]"
          >
            <option value="ALL">Todas las Acciones</option>
            {availableActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-md"
          >
            <Filter className="w-3.5 h-3.5" /> Filtrar
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="text-xs text-slate-400 px-1">
        Mostrando <strong className="text-white">{logs.length}</strong> de{' '}
        <strong className="text-white">{total}</strong> eventos de auditoría
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/60 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Fecha / Hora</th>
                <th className="p-3.5 font-semibold">Usuario Responsable</th>
                <th className="p-3.5 font-semibold">Acción</th>
                <th className="p-3.5 font-semibold">Entidad</th>
                <th className="p-3.5 font-semibold">Detalles de Operación</th>
                <th className="p-3.5 font-semibold">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                      Cargando historial de auditoría...
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('es-ES')}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-white text-xs">{log.user?.name || 'Sistema / Automático'}</p>
                      <p className="text-[10px] text-slate-400">{log.user?.email || 'N/A'}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${ACTION_COLORS[log.action] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-semibold">{log.entity}</td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate" title={log.details || ''}>
                      {log.details}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{log.ipAddress || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No hay registros de auditoría que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > PAGE_SIZE && (
          <div className="px-4 py-3 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
