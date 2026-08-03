'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, StatusType } from './StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { History, UserCheck, MessageSquare, Clock, MapPin, Briefcase, Mail, Phone, Calendar } from 'lucide-react';

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
  ci: string;
  ciExpedition: string;
  birthDate: string;
  age: number;
  gender: string;
  civilStatus: string;
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
  program: { name: string; code: string };
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

  // Initialize with current registration status when modal opens
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
      title={`Expediente: ${registration.fullName}`}
      subtitle={`Programa: ${registration.program.name} | Asesor: ${registration.advisor.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Status & Summary Bar */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Estado Actual</span>
            <div className="mt-1">
              <StatusBadge status={registration.status} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Fecha de Registro</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {new Date(registration.createdAt).toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        {/* Change Status Form */}
        <form onSubmit={handleUpdateStatus} className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" /> Cambiar Estado del Registro
          </h4>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Nuevo Estado
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as StatusType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Nota / Observación de Seguimiento
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Se envió cotización por WhatsApp..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Actualizar Estado'}
            </button>
          </div>
        </form>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b pb-1.5 border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Información Personal
            </h5>
            <p><span className="font-semibold text-slate-500">CI:</span> {registration.ci} ({registration.ciExpedition})</p>
            <p><span className="font-semibold text-slate-500">Nacimiento / Edad:</span> {new Date(registration.birthDate).toLocaleDateString()} ({registration.age} años)</p>
            <p><span className="font-semibold text-slate-500">Sexo / Est. Civil:</span> {registration.gender} | {registration.civilStatus}</p>
            <p><span className="font-semibold text-slate-500">Profesión:</span> {registration.profession}</p>
            <p><span className="font-semibold text-slate-500">Universidad:</span> {registration.university}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b pb-1.5 border-slate-200 dark:border-slate-700">
              <Mail className="w-3.5 h-3.5 text-indigo-500" /> Contacto & Trabajo
            </h5>
            <p><span className="font-semibold text-slate-500">Email:</span> {registration.email}</p>
            <p><span className="font-semibold text-slate-500">Teléfono / WA:</span> {registration.phone} / {registration.whatsapp}</p>
            <p><span className="font-semibold text-slate-500">Ubicación:</span> {registration.city}, {registration.state} ({registration.country})</p>
            <p><span className="font-semibold text-slate-500">Empresa / Cargo:</span> {registration.company} ({registration.position})</p>
            <p><span className="font-semibold text-slate-500">Modalidad Deseada:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{registration.modality}</span></p>
          </div>
        </div>

        {/* Status History Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-blue-500" /> Historial de Cambios de Estado
          </h4>

          <div className="space-y-2">
            {registration.statusHistory && registration.statusHistory.length > 0 ? (
              registration.statusHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.previousStatus} />
                      <span className="text-slate-400">→</span>
                      <StatusBadge status={item.newStatus} />
                    </div>
                    {item.note && (
                      <p className="text-slate-600 dark:text-slate-300 italic flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" /> "{item.note}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {item.changedBy?.name || 'Sistema'}
                    </p>
                    <p className="flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No hay historial registrado.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
