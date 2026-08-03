'use client';

import React, { useState, useEffect } from 'react';
import { ProgramFormModal } from '@/components/forms/ProgramFormModal';
import { GraduationCap, Plus, Edit, Trash2, Power, BookOpen, Search, CheckCircle2, XCircle, Filter, BookCheck } from 'lucide-react';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (res.ok) setPrograms(data.programs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProgramActive = async (program: any) => {
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: program.name,
          code: program.code,
          type: program.type,
          description: program.description,
          active: !program.active,
        }),
      });
      if (res.ok) fetchPrograms();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar o desactivar este programa?')) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPrograms();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPrograms = programs.length;
  const activePrograms = programs.filter((p) => p.active).length;
  const inactivePrograms = programs.filter((p) => !p.active).length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CURSO':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'DIPLOMADO':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'MAESTRIA':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'ESPECIALIDAD':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'DOCTORADO':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/20">
              Catálogo Académico
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Gestión de Oferta Académica</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cree y gestione Cursos, Diplomados, Maestrías, Especialidades y Doctorados. Habilite o deshabilite la captación en tiempo real.
          </p>
        </div>

        <button
          onClick={() => {
            setProgramToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Crear Programa / Curso
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Programas</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalPrograms}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-between justify-center text-blue-400">
            <BookOpen className="w-5 h-5 mx-auto" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Habilitados / Activos</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{activePrograms}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5 mx-auto" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Deshabilitados / Inactivos</p>
            <p className="text-2xl font-black text-rose-400 mt-0.5">{inactivePrograms}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5 mx-auto" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre o Código..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'CURSO', label: '📘 Cursos' },
            { id: 'DIPLOMADO', label: '📜 Diplomados' },
            { id: 'MAESTRIA', label: '🎓 Maestrías' },
            { id: 'ESPECIALIDAD', label: '🔬 Especialidades' },
            { id: 'DOCTORADO', label: '🏛️ Doctorados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                typeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))
        ) : filteredPrograms.length > 0 ? (
          filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className={`p-5 rounded-2xl bg-slate-900 border ${
                prog.active ? 'border-slate-800' : 'border-slate-800/50 opacity-80'
              } shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${getTypeBadge(prog.type)}`}>
                    {prog.type}
                  </span>

                  {/* Toggle Active Button */}
                  <button
                    onClick={() => toggleProgramActive(prog)}
                    title={prog.active ? 'Clic para Deshabilitar' : 'Clic para Habilitar'}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      prog.active
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-rose-950/80 hover:text-rose-400 hover:border-rose-800'
                        : 'bg-rose-950/80 text-rose-400 border-rose-800 hover:bg-emerald-950/80 hover:text-emerald-400 hover:border-emerald-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {prog.active ? 'Habilitado' : 'Deshabilitado'}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white mt-3 leading-tight group-hover:text-blue-400 transition-colors">
                  {prog.name}
                </h3>
                <p className="text-[11px] font-mono text-blue-400 font-bold mt-1">Código: {prog.code}</p>

                {prog.description ? (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{prog.description}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic mt-2">Sin descripción agregada</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 text-[11px] font-medium">
                  <strong className="text-white">{prog._count?.registrations || 0}</strong> Postulantes Registrados
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setProgramToEdit(prog);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    title="Editar programa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteProgram(prog.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <div>
              <p className="font-bold text-white text-sm">No se encontraron programas académicos.</p>
              <p className="text-xs text-slate-400">Intente cambiar los filtros o crear un nuevo programa o curso.</p>
            </div>
          </div>
        )}
      </div>

      <ProgramFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programToEdit={programToEdit}
        onProgramSaved={() => {
          setIsModalOpen(false);
          fetchPrograms();
        }}
      />
    </div>
  );
}
