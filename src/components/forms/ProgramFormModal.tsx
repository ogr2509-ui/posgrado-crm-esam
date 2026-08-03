'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface ProgramData {
  id?: string;
  name: string;
  code: string;
  type: 'CURSO' | 'DIPLOMADO' | 'MAESTRIA' | 'ESPECIALIDAD' | 'DOCTORADO';
  description?: string;
  active: boolean;
}

interface ProgramFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  programToEdit: ProgramData | null;
  onProgramSaved: () => void;
}

export function ProgramFormModal({
  isOpen,
  onClose,
  programToEdit,
  onProgramSaved,
}: ProgramFormModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'CURSO' | 'DIPLOMADO' | 'MAESTRIA' | 'ESPECIALIDAD' | 'DOCTORADO'>('MAESTRIA');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (programToEdit) {
      setName(programToEdit.name || '');
      setCode(programToEdit.code || '');
      setType(programToEdit.type || 'MAESTRIA');
      setDescription(programToEdit.description || '');
      setActive(programToEdit.active ?? true);
    } else {
      setName('');
      setCode('');
      setType('MAESTRIA');
      setDescription('');
      setActive(true);
    }
    setError(null);
  }, [programToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = programToEdit ? `/api/programs/${programToEdit.id}` : '/api/programs';
      const method = programToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, type, description, active }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar programa.');

      toast.success(
        programToEdit ? 'Programa actualizado' : 'Programa creado exitosamente',
        `El programa "${name}" ha sido guardado correctamente.`
      );
      onProgramSaved();
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al guardar programa', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={programToEdit ? 'Editar Oferta Académica' : 'Nuevo Programa Académico'}
      subtitle="Configure el nombre, código identificador y modalidad (Curso, Diplomado, Maestría, etc.)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-medium">
            {error}
          </p>
        )}

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Nombre Oficial del Programa *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Curso Especializado en Marketing Digital o Maestría en Educación Superior"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Código Identificador *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CUR-2026 / MED-2026"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tipo / Grado Académico *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="CURSO">📘 Curso</option>
              <option value="DIPLOMADO">📜 Diplomado</option>
              <option value="MAESTRIA">🎓 Maestría</option>
              <option value="ESPECIALIDAD">🔬 Especialidad</option>
              <option value="DOCTORADO">🏛️ Doctorado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Descripción o Plan de Estudios Sintético
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del programa..."
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="active-prog"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="active-prog" className="font-medium text-slate-700 dark:text-slate-300">
            Programa Activo (Permite generar enlaces e inscripciones)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : programToEdit ? 'Actualizar' : 'Crear Programa'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
