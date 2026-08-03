'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { StatusTimelineModal } from '@/components/dashboard/StatusTimelineModal';
import { Search, Filter, FileSpreadsheet, FileText, RefreshCw, Eye, MessageCircle, Phone, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const PAGE_SIZE = 20;

export default function RegistrationsPage() {
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Applied filters (used for actual fetch)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedProgram, setAppliedProgram] = useState('ALL');
  const [appliedStatus, setAppliedStatus] = useState('ALL');
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
      const sd = filters?.startDate ?? appliedStartDate;
      const ed = filters?.endDate ?? appliedEndDate;
      const p = filters?.page ?? page;

      if (s) queryParams.set('search', s);
      if (prog !== 'ALL') queryParams.set('programId', prog);
      if (stat !== 'ALL') queryParams.set('status', stat);
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
  }, [appliedSearch, appliedProgram, appliedStatus, appliedStartDate, appliedEndDate, page]);

  const handleApplyFilters = () => {
    setAppliedSearch(search);
    setAppliedProgram(selectedProgram);
    setAppliedStatus(selectedStatus);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(1);
    fetchRegistrations({
      search,
      programId: selectedProgram,
      status: selectedStatus,
      startDate,
      endDate,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    // Reset all UI state
    setSearch('');
    setSelectedProgram('ALL');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
    // Reset applied state and fetch with clean state
    setAppliedSearch('');
    setAppliedProgram('ALL');
    setAppliedStatus('ALL');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPage(1);
    fetchRegistrations({ search: '', programId: 'ALL', status: 'ALL', startDate: '', endDate: '', page: 1 });
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

  const openWhatsApp = (reg: any) => {
    const rawPhone = (reg.whatsapp || reg.phone || '').replace(/\D/g, '');
    const phone = rawPhone.length === 8 ? `591${rawPhone}` : rawPhone;
    const msg = encodeURIComponent(
      `Hola ${reg.fullName}, te escribo de Posgrado CRM respecto a tu postulación para ${reg.program?.name}. ¿Cómo estás?`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const queryParams = new URLSearchParams();
    queryParams.set('format', format);
    if (appliedSearch) queryParams.set('search', appliedSearch);
    if (appliedProgram !== 'ALL') queryParams.set('programId', appliedProgram);
    if (appliedStatus !== 'ALL') queryParams.set('status', appliedStatus);
    if (appliedStartDate) queryParams.set('startDate', appliedStartDate);
    if (appliedEndDate) queryParams.set('endDate', appliedEndDate);
    window.open(`/api/registrations/export?${queryParams.toString()}`, '_blank');
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
            Administración de prospectos captados, actualización de estados de matrícula y contacto directo por WhatsApp.
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
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-medium"
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
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-medium"
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

          {/* Date Range */}
          <div className="flex items-center gap-1 lg:col-span-2">
            <div className="relative flex-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-8 pr-2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none focus:border-blue-500"
                title="Fecha inicio"
              />
            </div>
            <span className="text-slate-500 text-xs shrink-0">—</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none focus:border-blue-500"
                title="Fecha fin"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2 justify-end">
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

      {/* Registrations Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/80 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Fecha</th>
                <th className="p-3.5 font-semibold">Postulante / CI</th>
                <th className="p-3.5 font-semibold">Contacto & Ciudad</th>
                <th className="p-3.5 font-semibold">Programa Académico</th>
                <th className="p-3.5 font-semibold">Asesor Asignado</th>
                <th className="p-3.5 font-semibold">Estado de Matrícula</th>
                <th className="p-3.5 font-semibold text-right">Acciones Comerciales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      Cargando postulaciones...
                    </div>
                  </td>
                </tr>
              ) : registrations.length > 0 ? (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(reg.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                        {reg.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">CI: {reg.ci} ({reg.ciExpedition})</p>
                      <p className="text-[10px] text-slate-500">{reg.profession}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="text-slate-300">{reg.email}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" /> {reg.phone}
                      </p>
                      <p className="text-[10px] text-slate-500">{reg.city}, {reg.state}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-200">{reg.program?.name}</p>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        [{reg.program?.type}] {reg.program?.code}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <span className="font-bold text-white">{reg.advisor?.name}</span>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={reg.status}
                        onChange={(e) => updateLeadStatus(reg.id, e.target.value)}
                        className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-white outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="NUEVO">🔹 Nuevo</option>
                        <option value="CONTACTADO">📞 Contactado</option>
                        <option value="DOC_PENDIENTE">📄 Doc. Pendiente</option>
                        <option value="COMPLETO">✅ Completo</option>
                        <option value="MATRICULADO">🎓 Matriculado</option>
                        <option value="DESCARTADO">❌ Descartado</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      {/* Direct WhatsApp Contact Button */}
                      <button
                        onClick={() => openWhatsApp(reg)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        title="Contactar vía WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WA
                      </button>

                      {/* Detail Record Modal Button */}
                      <button
                        onClick={() => setSelectedRegistration(reg)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 transition-colors inline-flex items-center gap-1"
                        title="Ver historial y expediente"
                      >
                        <Eye className="w-3.5 h-3.5" /> Expediente
                      </button>

                      {/* Delete Button (admin only) */}
                      {userRole === 'ADMIN' && (
                        <button
                          onClick={() => deleteRegistration(reg.id)}
                          className="px-2 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 font-bold text-xs inline-flex items-center transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 italic">
                    No se encontraron postulantes registrados con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > PAGE_SIZE && (
          <div className="px-4 py-3 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Mostrando <strong className="text-white">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)}</strong> de <strong className="text-white">{totalCount}</strong> registros
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
                Pág. {page} / {totalPages}
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

      {/* Detail Timeline Modal */}
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
