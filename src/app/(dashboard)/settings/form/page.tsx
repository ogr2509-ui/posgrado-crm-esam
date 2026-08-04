'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, CheckCircle2, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface FormSettings {
  datos_personales: boolean;
  documentos_ci: boolean;
  datos_contacto: boolean;
  datos_academicos: boolean;
}

const SECTIONS = [
  {
    key: 'datos_personales' as keyof FormSettings,
    title: '1. Datos Personales de Identidad',
    description: 'Incluye Nombres, Apellidos, Cédula de Identidad, Fecha de Nacimiento y Estado Civil.',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
  },
  {
    key: 'documentos_ci' as keyof FormSettings,
    title: '2. Documentación y Fotografías C.I.',
    description: 'Incluye los archivos o fotografías del carnet de identidad (Anverso obligatorio, Reverso opcional).',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
  },
  {
    key: 'datos_contacto' as keyof FormSettings,
    title: '3. Datos de Contacto y Residencia',
    description: 'Incluye Correo Electrónico, Teléfono Celular, WhatsApp, Dirección y Ciudad.',
    iconColor: 'text-indigo-500',
    borderColor: 'border-indigo-500/20',
  },
  {
    key: 'datos_academicos' as keyof FormSettings,
    title: '4. Perfil Académico y Experiencia Laboral',
    description: 'Incluye Grado Académico, Profesión u Ocupación y Universidad de Egreso.',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
  },
];

export default function FormSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<FormSettings>({
    datos_personales: true,
    documentos_ci: true,
    datos_contacto: true,
    datos_academicos: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/form-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof FormSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/form-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) throw new Error('Error al guardar la configuración');

      toast.success('Configuración Guardada', 'La configuración del formulario público ha sido actualizada.');
    } catch (error: any) {
      toast.error('Error de Guardado', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <SlidersHorizontal className="w-6 h-6 text-blue-500" />
            Configuración del Formulario Público
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Define cuáles apartados del formulario son obligatorios para la inscripción y cuáles opcionales.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4" />
          Solo Administradores
        </span>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Apartados del Formulario de Inscripción
        </p>

        <div className="grid grid-cols-1 gap-4">
          {SECTIONS.map((sec) => {
            const isMandatory = settings[sec.key];
            return (
              <div
                key={sec.key}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border ${
                  isMandatory
                    ? 'border-blue-500/30 dark:border-blue-500/30 shadow-md shadow-blue-500/5'
                    : 'border-slate-200 dark:border-slate-800 opacity-85'
                } transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {sec.title}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isMandatory
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isMandatory ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {sec.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(sec.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isMandatory
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isMandatory ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Obligatorio
                    </>
                  ) : (
                    'Marcar Obligatorio'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Guardando Configuración...' : 'Guardar Configuración de Apartados'}
        </button>
      </div>
    </div>
  );
}
