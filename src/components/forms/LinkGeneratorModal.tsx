'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Link as LinkIcon, Copy, Check, ExternalLink, Sparkles, MessageCircle, User } from 'lucide-react';

interface ProgramOption {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: { name: string };
}

interface LinkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: () => void;
}

export function LinkGeneratorModal({
  isOpen,
  onClose,
  onLinkCreated,
}: LinkGeneratorModalProps) {
  const toast = useToast();
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [advisors, setAdvisors] = useState<UserOption[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProgramsAndAdvisors();
      setGeneratedUrl(null);
      setCopied(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchProgramsAndAdvisors = async () => {
    try {
      const [progRes, userRes] = await Promise.all([
        fetch('/api/programs'),
        fetch('/api/users'),
      ]);

      const progData = await progRes.json();
      if (progRes.ok) {
        const activeProgs = (progData.programs || []).filter((p: any) => p.active);
        setPrograms(activeProgs);
        if (activeProgs.length > 0) setSelectedProgramId(activeProgs[0].id);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        const activeUsers = (userData.users || []).filter((u: any) => u.active);
        setAdvisors(activeUsers);
        if (activeUsers.length > 0) setSelectedAdvisorId(activeUsers[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgramId,
          advisorId: selectedAdvisorId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar enlace.');

      const baseUrl = window.location.origin;
      const fullLink = `${baseUrl}/f/${data.link.code}`;
      setGeneratedUrl(fullLink);
      toast.success('¡Enlace generado!', `El enlace fue creado y vinculado al asesor correctamente.`);
      onLinkCreated();
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al generar enlace', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareWhatsApp = () => {
    if (!generatedUrl) return;
    const selectedProg = programs.find((p) => p.id === selectedProgramId);
    const progText = selectedProg ? selectedProg.name : 'nuestros programas de posgrado';
    const message = encodeURIComponent(
      `¡Hola! 👋 Te invito a realizar tu postulación para ${progText}. Completa tu registro en el siguiente enlace oficial: ${generatedUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Enlace Promocional de Asesor"
      subtitle="Crea un enlace único asignado a un asesor de ventas para captar postulantes"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200 dark:border-rose-800 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleGenerateLink} className="space-y-4">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Programa / Curso Académico *
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  [{prog.type}] {prog.name} ({prog.code})
                </option>
              ))}
            </select>
          </div>

          {advisors.length > 0 && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Asesor de Ventas Asignado *
              </label>
              <select
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {advisors.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    👤 {adv.name} ({adv.email}) - [{adv.role?.name}]
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !selectedProgramId}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Generando Enlace...' : 'Generar Enlace Único del Asesor'}
          </button>
        </form>

        {/* Generated Link Display Box */}
        {generatedUrl && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" /> ¡Enlace Creado y Vinculado con Éxito!
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 uppercase border border-emerald-700">
                Activo
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-emerald-800">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="w-full text-xs bg-transparent text-white font-mono font-medium outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-md"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-bold text-[11px] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Compartir en WhatsApp
              </button>

              <a
                href={generatedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline"
              >
                Probar formulario público <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
