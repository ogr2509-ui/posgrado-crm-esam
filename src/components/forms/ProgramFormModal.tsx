'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProgramData {
  id?: string;
  name: string;
  code: string;
  type: 'CURSO' | 'DIPLOMADO' | 'MAESTRIA' | 'ESPECIALIDAD' | 'DOCTORADO';
  description?: string;
  imageUrl?: string | null;
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
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (programToEdit) {
      setName(programToEdit.name || '');
      setCode(programToEdit.code || '');
      setType(programToEdit.type || 'MAESTRIA');
      setDescription(programToEdit.description || '');
      setImageUrl(programToEdit.imageUrl || '');
      setActive(programToEdit.active ?? true);
    } else {
      setName('');
      setCode('');
      setType('MAESTRIA');
      setDescription('');
      setImageUrl('');
      setActive(true);
    }
    setError(null);
  }, [programToEdit, isOpen]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)/i)) {
      setError('Formato no soportado. Selecciona una imagen en formato JPG, PNG o WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen supera el tamaño máximo permitido de 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawDataUrl = event.target.result as string;
        const img = new Image();
        img.src = rawDataUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1000;
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setImageUrl(compressedDataUrl);
              setError(null);
              return;
            }
          } catch (err) {
            console.error('Image compression error:', err);
          }
          setImageUrl(rawDataUrl);
          setError(null);
        };
      }
    };
    reader.readAsDataURL(file);
  };

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
        body: JSON.stringify({ name, code, type, description, imageUrl, active }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar programa.');

      toast.success(
        programToEdit ? 'Programa actualizado' : 'Programa creado exitosamente',
        `El programa "${name}" y su enlace de inscripción se crearon correctamente.`
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
      subtitle="Configure el nombre, código, imagen del programa y enlace automático de inscripción"
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
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
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

        {/* Image Upload Input (JPG, PNG, WEBP) */}
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Imagen Promocional del Programa (JPG, PNG, WEBP)
          </label>

          {imageUrl ? (
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 group shadow-inner">
              <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover object-center" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors shadow-lg"
                title="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/50 transition-colors cursor-pointer relative text-center">
              <Upload className="w-6 h-6 text-blue-500 mb-1" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Seleccionar imagen (JPG, PNG, WEBP)</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Haz clic para cargar el archivo desde tu equipo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
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
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="active-prog"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="active-prog" className="font-medium text-slate-700 dark:text-slate-300">
            Programa Activo (Permite enlace público e inscripciones)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            {isLoading ? 'Guardando...' : programToEdit ? 'Actualizar Programa' : 'Crear Programa e Enlace'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
