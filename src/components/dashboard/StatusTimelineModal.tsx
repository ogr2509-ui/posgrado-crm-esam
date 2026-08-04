'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, StatusType } from './StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { History, UserCheck, MessageSquare, Clock, MapPin, Briefcase, Mail, Phone, Calendar, Download, Eye, FileText, GraduationCap, User, Image as ImageIcon } from 'lucide-react';

interface StatusHistoryItem {
  id: string;
  previousStatus: string;
  newStatus: string;
  note?: string | null;
  createdAt: string;
  changedBy?: { name: string } | null;
}

interface RegistrationDetail {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  ci: string;
  ciExpedition: string;
  birthDate: string;
  age: number;
  gender: string;
  civilStatus: string;
  ciAnversoUrl?: string | null;
  ciReversoUrl?: string | null;
  academicDegree?: string | null;
  profession: string;
  university: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  company: string;
  position: string;
  experienceYears: number;
  modality: string;
  channel: string;
  notes?: string | null;
  status: string;
  createdAt: string;
  program: { name: string; code: string; type?: string };
  advisor: { name: string; email: string };
  statusHistory?: StatusHistoryItem[];
}

interface StatusTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: RegistrationDetail | null;
  onStatusUpdated: () => void;
}

export function StatusTimelineModal({
  isOpen,
  onClose,
  registration,
  onStatusUpdated,
}: StatusTimelineModalProps) {
  const toast = useToast();
  const [newStatus, setNewStatus] = useState<StatusType>('NUEVO');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (registration && isOpen) {
      setNewStatus(registration.status as StatusType);
      setNote('');
      setError(null);
    }
  }, [registration, isOpen]);

  if (!registration) return null;

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar el estado.');

      toast.success('Estado actualizado', `El expediente fue movido a "${newStatus}" correctamente.`);
      setNote('');
      onStatusUpdated();
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al actualizar estado', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = (dataUrl: string | null | undefined, defaultFilename: string) => {
    if (!dataUrl) return;
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descarga iniciada', `El archivo ${defaultFilename} ha comenzado a descargarse.`);
    } catch (e) {
      console.error(e);
      window.open(dataUrl, '_blank');
    }
  };

  const handleDownloadFullDossier = () => {
    const content = `=====================================================
FICHA OFICIAL DE INSCRIPCIÓN Y EXPEDIENTE DE POSTULANTE
POSGRADO ENTERPRISE - CRM COMERCIAL ESAM
=====================================================

DATOS DEL PROGRAMA ACADÉMICO:
- Programa: ${registration.program.name} (${registration.program.code})
- Asesor Asignado: ${registration.advisor.name} (${registration.advisor.email})
- Fecha de Postulación: ${new Date(registration.createdAt).toLocaleString('es-ES')}
- Estado Actual: ${registration.status}

1. DATOS PERSONALES:
- Nombres Completo: ${registration.fullName}
- Cédula de Identidad: ${registration.ci} ${registration.ciExpedition}
- Fecha de Nacimiento: ${new Date(registration.birthDate).toLocaleDateString()} (${registration.age} años)
- Estado Civil: ${registration.civilStatus}
- Sexo: ${registration.gender}

2. DATOS DE CONTACTO Y RESIDENCIA:
- Correo Electrónico: ${registration.email}
- Celular / WhatsApp: ${registration.phone} / ${registration.whatsapp}
- Dirección: ${registration.address}
- Ciudad / Ubicación: ${registration.city}, ${registration.state} (${registration.country})

3. DATOS ACADÉMICOS Y PROFESIONALES:
- Grado Académico: ${registration.academicDegree || 'No especificado'}
- Profesión / Título: ${registration.profession}
- Universidad de Egreso: ${registration.university}
- Empresa / Institución: ${registration.company}
- Cargo Actual: ${registration.position}

DOCUMENTOS ADJUNTOS DE IDENTIDAD:
- C.I. Anverso (Frente): ${registration.ciAnversoUrl ? 'Adjunto / Disponible' : 'No adjuntado'}
- C.I. Reverso (Atrás): ${registration.ciReversoUrl ? 'Adjunto / Disponible' : 'No adjuntado'}

=====================================================
Generado automáticamente por Posgrado Enterprise CRM
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expediente_${registration.fullName.replace(/\s+/g, '_')}_${registration.ci}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Expediente Descargado', 'Se descargó el expediente completo del estudiante.');
  };

  const statusOptions: { value: StatusType; label: string }[] = [
    { value: 'NUEVO', label: 'Nuevo' },
    { value: 'CONTACTADO', label: 'Contactado' },
    { value: 'DOC_PENDIENTE', label: 'Documentación Pendiente' },
    { value: 'COMPLETO', label: 'Inscripción Completa' },
    { value: 'MATRICULADO', label: 'Matriculado' },
    { value: 'DESCARTADO', label: 'Descartado' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Expediente Estudiantil: ${registration.fullName}`}
      subtitle={`Programa: ${registration.program.name} | Asesor: ${registration.advisor.name}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Status Bar & Export Action */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Estado Actual del Lead</span>
            <div className="mt-1">
              <StatusBadge status={registration.status} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadFullDossier}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold border border-blue-500/30 text-xs transition-colors shadow-sm"
              title="Descargar Ficha Completa en Formato Texto/Documento"
            >
              <Download className="w-4 h-4 text-blue-400" /> Descargar Ficha del Estudiante
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Registro</span>
              <span className="text-xs font-mono font-semibold text-slate-300">
                {new Date(registration.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Change Status Form */}
        <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/60 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" /> Actualizar Estado de Admisión
          </h4>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded-xl border border-rose-800">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nuevo Estado
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as StatusType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nota u Observación de Seguimiento
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Documentos revisados y validados..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Estado'}
            </button>
          </div>
        </form>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Datos Personales */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <h5 className="font-bold text-white flex items-center gap-2 border-b pb-2 border-slate-800">
              <User className="w-4 h-4 text-blue-400" /> 1. Datos Personales
            </h5>
            <p><span className="font-semibold text-slate-400">Nombres y Apellidos:</span> <strong className="text-white">{registration.fullName}</strong></p>
            <p><span className="font-semibold text-slate-400">C.I. y Extensión:</span> <strong className="text-blue-400 font-mono">{registration.ci} {registration.ciExpedition}</strong></p>
            <p><span className="font-semibold text-slate-400">Nacimiento / Edad:</span> {new Date(registration.birthDate).toLocaleDateString()} ({registration.age} años)</p>
            <p><span className="font-semibold text-slate-400">Estado Civil / Sexo:</span> {registration.civilStatus} | {registration.gender}</p>
            <p><span className="font-semibold text-slate-400">Dirección:</span> {registration.address}</p>
            <p><span className="font-semibold text-slate-400">Ciudad:</span> {registration.city}</p>
          </div>

          {/* Datos Académicos y Contacto */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <h5 className="font-bold text-white flex items-center gap-2 border-b pb-2 border-slate-800">
              <GraduationCap className="w-4 h-4 text-purple-400" /> 2. Datos Académicos y Contacto
            </h5>
            <p><span className="font-semibold text-slate-400">Grado Académico:</span> <strong className="text-purple-300">{registration.academicDegree || 'Licenciatura'}</strong></p>
            <p><span className="font-semibold text-slate-400">Profesión:</span> {registration.profession}</p>
            <p><span className="font-semibold text-slate-400">Universidad Egreso:</span> {registration.university}</p>
            <p><span className="font-semibold text-slate-400">Email:</span> <strong className="text-blue-400">{registration.email}</strong></p>
            <p><span className="font-semibold text-slate-400">Celular / WhatsApp:</span> {registration.phone}</p>
            <p><span className="font-semibold text-slate-400">Empresa / Cargo:</span> {registration.company} ({registration.position})</p>
          </div>
        </div>

        {/* FOTO / DOCUMENTOS DE C.I. (Carnet Anverso y Reverso) - VER Y DESCARGAR */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-slate-800">
            <h5 className="font-bold text-white flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-emerald-400" /> Documentos de Identidad (Fotos de C.I.)
            </h5>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Ver & Descargar Habilitados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* C.I. Anverso */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">1. C.I. Anverso (Frente)</span>
              {registration.ciAnversoUrl ? (
                <div className="space-y-3">
                  {registration.ciAnversoUrl.startsWith('data:image') ? (
                    <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 relative group">
                      <img
                        src={registration.ciAnversoUrl}
                        alt="C.I. Anverso"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                      <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">Documento Adjunto (PDF/Word/ODF)</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(registration.ciAnversoUrl!, '_blank')}
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold text-xs border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Documento
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(registration.ciAnversoUrl, `CI_Anverso_${registration.ci}.png`)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 text-center text-slate-500 italic text-xs">
                  No se adjuntó archivo de C.I. Anverso.
                </div>
              )}
            </div>

            {/* C.I. Reverso */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">2. C.I. Reverso (Atrás)</span>
              {registration.ciReversoUrl ? (
                <div className="space-y-3">
                  {registration.ciReversoUrl.startsWith('data:image') ? (
                    <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 relative group">
                      <img
                        src={registration.ciReversoUrl}
                        alt="C.I. Reverso"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                      <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">Documento Adjunto (PDF/Word/ODF)</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(registration.ciReversoUrl!, '_blank')}
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold text-xs border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Documento
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(registration.ciReversoUrl, `CI_Reverso_${registration.ci}.png`)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 text-center text-slate-500 italic text-xs">
                  No se adjuntó archivo de C.I. Reverso.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-blue-400" /> Historial de Cambios de Estado
          </h4>

          <div className="space-y-2">
            {registration.statusHistory && registration.statusHistory.length > 0 ? (
              registration.statusHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.previousStatus} />
                      <span className="text-slate-500">→</span>
                      <StatusBadge status={item.newStatus} />
                    </div>
                    {item.note && (
                      <p className="text-slate-300 italic flex items-center gap-1 text-[11px]">
                        <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" /> "{item.note}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <p className="font-medium text-slate-200">
                      {item.changedBy?.name || 'Sistema'}
                    </p>
                    <p className="flex items-center gap-1 justify-end text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No hay historial registrado.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
