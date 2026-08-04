'use client';

import React, { useState, useEffect } from 'react';
import { LinkGeneratorModal } from '@/components/forms/LinkGeneratorModal';
import { Link as LinkIcon, Plus, Copy, Check, ExternalLink, Trash2, Power, MessageCircle, Eye, Search, UserCheck } from 'lucide-react';

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      if (res.ok) setLinks(data.links || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyLinkUrl = (code: string, id: string) => {
    const fullUrl = `${window.location.origin}/f/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareWhatsApp = (code: string, programName: string) => {
    const fullUrl = `${window.location.origin}/f/${code}`;
    const text = encodeURIComponent(
      `¡Hola! 👋 Te comparto el enlace de postulación oficial para el programa ${programName}. Registra tus datos aquí: ${fullUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const toggleLinkActive = async (link: any) => {
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !link.active }),
      });
      if (res.ok) fetchLinks();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este enlace rastreable?')) return;
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok) fetchLinks();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLinks = links.filter((l) => {
    const term = search.toLowerCase();
    return (
      l.program?.name.toLowerCase().includes(term) ||
      l.program?.code.toLowerCase().includes(term) ||
      l.advisor?.name.toLowerCase().includes(term) ||
      l.code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/20">
              Tracking Comercial
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Enlaces Oficiales por Programa Académico</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enlaces de captación unificados por programa para compartir con postulantes. Son idénticos tanto para asesores de ventas como para el administrador.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Generar Nuevo Enlace
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Programa, Asesor o Código..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Enlaces</p>
            <p className="text-2xl font-black text-white mt-0.5">{links.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <LinkIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Activos</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{links.filter((l) => l.active).length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Clics</p>
            <p className="text-2xl font-black text-blue-400 mt-0.5">{links.reduce((sum, l) => sum + (l.clickCount || 0), 0)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Leads Captados</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{links.reduce((sum, l) => sum + (l._count?.registrations || 0), 0)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <LinkIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Links Cards Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))
        ) : filteredLinks.length > 0 ? (
          filteredLinks.map((l) => (
            <div
              key={l.id}
              className={`p-5 rounded-2xl bg-slate-900 border ${
                l.active ? 'border-slate-800' : 'border-slate-800/50 opacity-75'
              } shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all group`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/80 uppercase">
                    [{l.program?.type || 'POSGRADO'}] {l.program?.code}
                  </span>

                  <button
                    onClick={() => toggleLinkActive(l)}
                    title={l.active ? 'Deshabilitar enlace' : 'Habilitar enlace'}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-bold border transition-all ${
                      l.active
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-rose-950/80 hover:text-rose-400'
                        : 'bg-rose-950/80 text-rose-400 border-rose-800 hover:bg-emerald-950/80 hover:text-emerald-400'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {l.active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                    {l.program?.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Asesor: <strong className="text-white">{l.advisor?.name}</strong></span>
                  </div>
                </div>

                {/* Track Code URL Box */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-blue-400 font-bold truncate">/f/{l.code}</span>
                  <button
                    onClick={() => copyLinkUrl(l.code, l.id)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 transition-colors shadow-md"
                  >
                    {copiedId === l.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === l.id ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">
                    <strong className="text-blue-400">{l.clickCount || 0}</strong> Clics |{' '}
                    <strong className="text-emerald-400">{l._count?.registrations || 0}</strong> Leads
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => shareWhatsApp(l.code, l.program?.name)}
                    className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/50 transition-colors"
                    title="Compartir en WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <a
                    href={`/f/${l.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/50 transition-colors"
                    title="Probar formulario público"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => deleteLink(l.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors"
                    title="Eliminar enlace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <LinkIcon className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <div>
              <p className="font-bold text-white text-sm">No hay enlaces promocionales registrados.</p>
              <p className="text-xs text-slate-400">Genere un nuevo enlace asignado a un asesor de ventas para empezar a recibir postulaciones.</p>
            </div>
          </div>
        )}
      </div>

      <LinkGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLinkCreated={() => {
          fetchLinks();
        }}
      />
    </div>
  );
}
