'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { StatusTimelineModal } from '@/components/dashboard/StatusTimelineModal';
import { Search, Filter, FileSpreadsheet, FileText, RefreshCw, Eye, MessageCircle, Phone, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const PAGE_SIZE = 20;

const MONTHS = [
  { value: 'ALL', label: '🗓️ Todos los meses' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const YEARS = ['ALL', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];

export default function RegistrationsPage() {
  const now = new Date();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [userRole, setUserRole] = useState<string>('ASESOR');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Applied filters (used for actual fetch)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedProgram, setAppliedProgram] = useState('ALL');
  const [appliedStatus, setAppliedStatus] = useState('ALL');
  const [appliedMonth, setAppliedMonth] = useState<string>(String(now.getMonth() + 1));
  const [appliedYear, setAppliedYear] = useState<string>(String(now.getFullYear()));
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  useEffect(() => {
    fetchPrograms();
    fetchUserRole();
    fetchRegistrations();
  }, []);

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok) setUserRole(data.user?.role || 'ASESOR');
    } catch {}
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (res.ok) setPrograms(data.programs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegistrations = useCallback(async (filters?: {
    search?: string;
    programId?: string;
    status?: string;
    month?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
  }) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      const s = filters?.search ?? appliedSearch;
      const prog = filters?.programId ?? appliedProgram;
      const stat = filters?.status ?? appliedStatus;
      const m = filters?.month ?? appliedMonth;
      const y = filters?.year ?? appliedYear;
      const sd = filters?.startDate ?? appliedStartDate;
      const ed = filters?.endDate ?? appliedEndDate;
      const p = filters?.page ?? page;

      if (s) queryParams.set('search', s);
      if (prog !== 'ALL') queryParams.set('programId', prog);
      if (stat !== 'ALL') queryParams.set('status', stat);
      if (m !== 'ALL') queryParams.set('month', m);
      if (y !== 'ALL') queryParams.set('year', y);
      if (sd) queryParams.set('startDate', sd);
      if (ed) queryParams.set('endDate', ed);
      queryParams.set('skip', String((p - 1) * PAGE_SIZE));
      queryParams.set('take', String(PAGE_SIZE));

      const res = await fetch(`/api/registrations?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setRegistrations(data.registrations || []);
        setTotalCount(data.total ?? (data.registrations || []).length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, appliedProgram, appliedStatus, appliedMonth, appliedYear, appliedStartDate, appliedEndDate, page]);

  const handleApplyFilters = () => {
    setAppliedSearch(search);
    setAppliedProgram(selectedProgram);
    setAppliedStatus(selectedStatus);
    setAppliedMonth(selectedMonth);
    setAppliedYear(selectedYear);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(1);
    fetchRegistrations({
      search,
      programId: selectedProgram,
      status: selectedStatus,
      month: selectedMonth,
      year: selectedYear,
      startDate,
      endDate,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedProgram('ALL');
    setSelectedStatus('ALL');
    setSelectedMonth('ALL');
    setSelectedYear('ALL');
    setStartDate('');
    setEndDate('');

    setAppliedSearch('');
    setAppliedProgram('ALL');
    setAppliedStatus('ALL');
    setAppliedMonth('ALL');
    setAppliedYear('ALL');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPage(1);
    fetchRegistrations({ search: '', programId: 'ALL', status: 'ALL', month: 'ALL', year: 'ALL', startDate: '', endDate: '', page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRegistrations({ page: newPage });
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: `Estado actualizado a ${newStatus} desde la tabla` }),
      });
      if (res.ok) fetchRegistrations();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRegistrations();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const queryParams = new URLSearchParams();
    if (appliedSearch) queryParams.set('search', appliedSearch);
    if (appliedProgram !== 'ALL') queryParams.set('programId', appliedProgram);
    if (appliedStatus !== 'ALL') queryParams.set('status', appliedStatus);
    if (appliedMonth !== 'ALL') queryParams.set('month', appliedMonth);
    if (appliedYear !== 'ALL') queryParams.set('year', appliedYear);
    if (appliedStartDate) queryParams.set('startDate', appliedStartDate);
    if (appliedEndDate) queryParams.set('endDate', appliedEndDate);
    queryParams.set('format', format);

    window.open(`/api/registrations/export?${queryParams.toString()}`, '_blank');
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/20">
            Captación Comercial
          </span>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">Gestión de Postulantes e Inscritos</h1>
          <p className="text-xs text-slate-400">
            {userRole === 'ADMIN'
              ? 'Panel global de postulantes registrados en todos los programas y enlaces.'
              : 'Gestión de prospectos inscritos a través de tus enlaces personales.'}
          </p>
        </div>

        {/* Export Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            <FileText className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              placeholder="Nombre, CI, Correo o Celular..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Programas</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.type}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="NUEVO">Nuevo Lead</option>
              <option value="CONTACTADO">Contactado</option>
              <option value="DOC_PENDIENTE">Doc. Pendiente</option>
              <option value="COMPLETO">Inscripción Completa</option>
              <option value="MATRICULADO">Matriculado</option>
              <option value="DESCARTADO">Descartado</option>
            </select>
          </div>

          {/* Month & Year Filter Dropdowns */}
          <div className="flex items-center gap-1.5 lg:col-span-2">
            <div className="flex-1 flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer w-full"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-28 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-bold text-blue-400 outline-none cursor-pointer w-full"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y === 'ALL' ? 'Todos los años' : y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2 justify-end pt-1">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition-colors"
            title="Limpiar Filtros"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Limpiar
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Filter className="w-3.5 h-3.5" /> Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Mostrando <strong className="text-white">{registrations.length}</strong> de{' '}
            <strong className="text-white">{totalCount}</strong> postulaciones en este período
          </p>

          {/* Pagination Controls Top */}
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 font-bold">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Fecha / ID</th>
                <th className="p-3.5 font-bold">Postulante</th>
                <th className="p-3.5 font-bold">Programa Académico</th>
                <th className="p-3.5 font-bold">Asesor Responsable</th>
                <th className="p-3.5 font-bold">Modalidad / Canal</th>
                <th className="p-3.5 font-bold">Estado Actual</th>
                <th className="p-3.5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="p-4 bg-slate-900/50" />
                  </tr>
                ))
              ) : registrations.length > 0 ? (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      <p className="font-bold text-slate-300">{new Date(reg.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] font-mono text-slate-500">{new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-white text-xs">{reg.fullName}</p>
                      <p className="text-[11px] text-slate-400">CI: {reg.ci} {reg.ciExpedition}</p>
                      <p className="text-[10px] text-blue-400">{reg.email}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/80 uppercase">
                        {reg.program?.type}
                      </span>
                      <p className="font-bold text-slate-200 text-xs mt-1 line-clamp-1">{reg.program?.name}</p>
                    </td>

                    <td className="p-3.5 text-slate-300 font-semibold">
                      {reg.advisor?.name || 'Sistema'}
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      <p className="font-bold text-slate-300">{reg.modality}</p>
                      <p className="text-[10px] text-slate-500">{reg.channel}</p>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <StatusBadge status={reg.status} />
                        <select
                          value={reg.status}
                          onChange={(e) => updateLeadStatus(reg.id, e.target.value)}
                          className="block w-full text-[10px] font-bold py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 outline-none cursor-pointer"
                        >
                          <option value="NUEVO">Cambiar: Nuevo</option>
                          <option value="CONTACTADO">Cambiar: Contactado</option>
                          <option value="DOC_PENDIENTE">Cambiar: Doc. Pendiente</option>
                          <option value="COMPLETO">Cambiar: Completo</option>
                          <option value="MATRICULADO">Cambiar: Matriculado</option>
                          <option value="DESCARTADO">Cambiar: Descartado</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {reg.whatsapp && (
                          <a
                            href={`https://wa.me/${reg.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setSelectedRegistration(reg)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold border border-blue-500/30 text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Expediente
                        </button>

                        {userRole === 'ADMIN' && (
                          <button
                            onClick={() => deleteRegistration(reg.id)}
                            className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No se encontraron postulaciones registradas en este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 font-medium">
            Página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-bold transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-bold transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Expediente */}
      <StatusTimelineModal
        isOpen={!!selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        registration={selectedRegistration}
        onStatusUpdated={() => {
          setSelectedRegistration(null);
          fetchRegistrations();
        }}
      />
    </div>
  );
}
