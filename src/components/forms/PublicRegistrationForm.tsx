'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, User, GraduationCap, FileText, Upload, Trash2, ShieldCheck, Send, AlertCircle, Award, Lock, Check } from 'lucide-react';

interface PublicRegistrationFormProps {
  code: string;
  program: {
    id: string;
    name: string;
    code: string;
    type: string;
    description?: string;
    imageUrl?: string;
  };
  advisor: {
    name: string;
    phone?: string;
  };
}

export function PublicRegistrationForm({ code, program, advisor }: PublicRegistrationFormProps) {
  const [formSettings, setFormSettings] = useState<{
    datos_personales: boolean;
    documentos_ci: boolean;
    datos_contacto: boolean;
    datos_academicos: boolean;
  }>({
    datos_personales: true,
    documentos_ci: true,
    datos_contacto: true,
    datos_academicos: true,
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    ci: '',
    ciExpedition: 'LP',
    email: '',
    address: '',
    city: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
    age: 25,
    civilStatus: 'Soltero(a)',
    gender: 'Masculino',
    ciAnversoUrl: '',
    ciReversoUrl: '',
    
    academicDegree: 'Licenciatura',
    profession: '',
    university: '',

    company: 'Particular',
    position: 'Profesional',
    experienceYears: 2,
    modality: 'VIRTUAL',
    channel: 'Formulario Web',
    notes: '',
    termsAccepted: true,
  });

  const [ciAnversoFile, setCiAnversoFile] = useState<{ name: string; size: string; preview: string } | null>(null);
  const [ciReversoFile, setCiReversoFile] = useState<{ name: string; size: string; preview: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchFormSettings();
  }, []);

  const fetchFormSettings = async () => {
    try {
      const res = await fetch('/api/admin/form-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setFormSettings(data.settings);
        }
      }
    } catch (e) {
      console.error('Error fetching dynamic form settings:', e);
    }
  };

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 25;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bdate = e.target.value;
    const computedAge = calculateAge(bdate);
    setFormData((prev) => ({
      ...prev,
      birthDate: bdate,
      age: computedAge,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'anverso' | 'reverso') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo permitido de 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileMeta = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: dataUrl,
      };

      if (target === 'anverso') {
        setCiAnversoFile(fileMeta);
        setFormData((prev) => ({ ...prev, ciAnversoUrl: dataUrl }));
      } else {
        setCiReversoFile(fileMeta);
        setFormData((prev) => ({ ...prev, ciReversoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (target: 'anverso' | 'reverso') => {
    if (target === 'anverso') {
      setCiAnversoFile(null);
      setFormData((prev) => ({ ...prev, ciAnversoUrl: '' }));
    } else {
      setCiReversoFile(null);
      setFormData((prev) => ({ ...prev, ciReversoUrl: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formSettings.datos_personales && formData.age < 18) {
      setError('Debes ser mayor de 18 años para inscribirte a un programa de posgrado.');
      setIsSubmitting(false);
      return;
    }

    if (formSettings.documentos_ci && !formData.ciAnversoUrl) {
      setError('El Administrador ha establecido que la foto del C.I. Anverso es obligatoria.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        whatsapp: formData.phone,
      };

      const res = await fetch(`/api/public/form/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar la inscripción.');

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-fade-in my-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">¡Postulación Registrada Exitosamente!</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Gracias <strong className="text-white">{formData.firstName} {formData.lastName}</strong>. Tu ficha de postulación para el programa{' '}
            <strong className="text-blue-400">{program.name}</strong> ha sido recibida correctamente.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
          <p className="text-slate-400">
            👤 <strong className="text-slate-200">Asesor Comercial Asignado:</strong> {advisor.name}
          </p>
          <p className="text-slate-400">
            📱 <strong className="text-slate-200">Contacto Directo:</strong> {advisor.phone || 'Atención en Línea'}
          </p>
        </div>

        <p className="text-xs text-slate-500">
          Un representante comercial de posgrado se pondrá en contacto contigo a través de WhatsApp o llamada telefónica para formalizar tu proceso de admisión.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full overflow-x-hidden px-1 sm:px-4">
      {/* Centered Header Banner */}
      <div className="p-5 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-2xl text-center space-y-3 sm:space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-center flex-wrap gap-2 relative z-10">
          <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/30 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> {program.type}
          </span>
          <span className="text-xs text-slate-400 font-mono">CÓDIGO: {program.code}</span>
        </div>

        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white text-center tracking-tight leading-snug sm:leading-tight max-w-4xl mx-auto relative z-10 px-2">
          {program.name}
        </h1>

        <div className="pt-1 sm:pt-2 relative z-10">
          <div className="inline-flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] sm:text-xs font-semibold text-slate-300 shadow-md max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-400">Asesor Comercial Asignado:</span>
            <strong className="text-white font-bold">{advisor.name}</strong>
          </div>
        </div>
      </div>

      {/* Responsive Split 2-Column Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Vertical Promotional Image */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-2 sm:p-3">
            {program.imageUrl ? (
              <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-inner flex flex-col items-center justify-center p-1">
                <img
                  src={program.imageUrl}
                  alt={program.name}
                  className="w-full h-auto max-h-[850px] object-contain object-center rounded-lg sm:rounded-xl"
                />
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 min-h-[360px] sm:min-h-[520px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-black uppercase tracking-wider">
                    {program.type}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{program.name}</h3>
                  <p className="text-xs text-slate-400">
                    {program.description || 'Programa de posgrado diseñado para potenciar tu perfil profesional.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Registration Form Fields */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 sm:space-y-10">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* ==================== SECCIÓN 1: DATOS PERSONALES ==================== */}
            <div className="space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">1. DATOS PERSONALES</h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">Información de identificación del postulante</p>
                  </div>
                </div>
                <span className={`self-start sm:self-auto text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${formSettings.datos_personales ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  {formSettings.datos_personales ? 'Obligatorio' : 'Opcional'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Nombres */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Nombres {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={formSettings.datos_personales}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Ej. Juan Carlos"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* Apellidos */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Apellidos {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={formSettings.datos_personales}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ej. Pérez Gómez"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* C.I. y Extensión */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">
                    C.I. y Extensión {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required={formSettings.datos_personales}
                      value={formData.ci}
                      onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                      placeholder="Número de Cédula de Identidad"
                      className="flex-1 px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    />
                    <select
                      value={formData.ciExpedition}
                      onChange={(e) => setFormData({ ...formData, ciExpedition: e.target.value })}
                      className="w-full sm:w-32 px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="LP">LP - La Paz</option>
                      <option value="CB">CB - Cochabamba</option>
                      <option value="SC">SC - Santa Cruz</option>
                      <option value="OR">OR - Oruro</option>
                      <option value="PT">PT - Potosí</option>
                      <option value="TJ">TJ - Tarija</option>
                      <option value="CH">CH - Chuquisaca</option>
                      <option value="BE">BE - Beni</option>
                      <option value="PA">PA - Pando</option>
                      <option value="EXT">EXT - Extranjero</option>
                    </select>
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Correo Electrónico {formSettings.datos_contacto ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="email"
                    required={formSettings.datos_contacto}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* Celular / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Celular / WhatsApp {formSettings.datos_contacto ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="tel"
                    required={formSettings.datos_contacto}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej. 71234567"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* Dirección */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Dirección de Domicilio {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={formSettings.datos_personales}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Zona, Calle / Av. y Número"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* Ciudad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Ciudad {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={formSettings.datos_personales}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ej. La Paz, Cochabamba, Santa Cruz"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Fecha de Nacimiento {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="date"
                    required={formSettings.datos_personales}
                    value={formData.birthDate}
                    onChange={handleDateChange}
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  {formData.birthDate && (
                    <span className="text-[10px] text-blue-400 font-semibold block">Edad calculada: {formData.age} años</span>
                  )}
                </div>

                {/* Estado Civil */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Estado Civil {formSettings.datos_personales ? '*' : '(Opcional)'}
                  </label>
                  <select
                    value={formData.civilStatus}
                    onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium outline-none cursor-pointer focus:border-blue-500"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                    <option value="Unión Libre">Unión Libre / Conviviente</option>
                  </select>
                </div>
              </div>

              {/* FOTO DE C.I. (ANVERSO Y REVERSO) */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" /> FOTO DE C.I. (ANVERSO Y REVERSO)
                  </label>
                  <span className={`self-start sm:self-auto text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${formSettings.documentos_ci ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {formSettings.documentos_ci ? 'Obligatorio' : 'Opcional'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Carga el anverso y reverso de tu Cédula de Identidad en formato de Imagen (PNG, JPG, WEBP), PDF, Word (.doc, .docx) u ODF (.odt).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: C.I. Anverso */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      1. C.I. Anverso (Frente) {formSettings.documentos_ci ? '*' : '(Opcional)'}
                    </span>
                    {ciAnversoFile ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-inner">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{ciAnversoFile.name}</p>
                            <p className="text-[10px] text-emerald-400">{ciAnversoFile.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('anverso')}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Quitar archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950 hover:bg-slate-800/20 transition-all cursor-pointer text-center group">
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 mb-1 transition-colors" />
                        <span className="text-xs font-bold text-slate-300">Cargar Anverso (Frente)</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP, PDF, Word, ODF (Máx 10MB)</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.odt"
                          onChange={(e) => handleFileUpload(e, 'anverso')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Field 2: C.I. Reverso */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">2. C.I. Reverso (Atrás) (Opcional)</span>
                    {ciReversoFile ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-inner">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{ciReversoFile.name}</p>
                            <p className="text-[10px] text-emerald-400">{ciReversoFile.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('reverso')}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Quitar archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950 hover:bg-slate-800/20 transition-all cursor-pointer text-center group">
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 mb-1 transition-colors" />
                        <span className="text-xs font-bold text-slate-300">Cargar Reverso (Atrás)</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP, PDF, Word, ODF (Máx 10MB)</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.odt"
                          onChange={(e) => handleFileUpload(e, 'reverso')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== SECCIÓN 2: DATOS ACADÉMICOS ==================== */}
            <div className="space-y-5 sm:space-y-6 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30 shrink-0">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">2. DATOS ACADÉMICOS</h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">Formación universitaria y nivel profesional del postulante</p>
                  </div>
                </div>
                <span className={`self-start sm:self-auto text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${formSettings.datos_academicos ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  {formSettings.datos_academicos ? 'Obligatorio' : 'Opcional'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* Grado Académico */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Grado Académico {formSettings.datos_academicos ? '*' : '(Opcional)'}
                  </label>
                  <select
                    value={formData.academicDegree}
                    onChange={(e) => setFormData({ ...formData, academicDegree: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none cursor-pointer focus:border-purple-500"
                  >
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Ingeniería">Ingeniería</option>
                    <option value="Técnico Superior">Técnico Superior</option>
                    <option value="Diplomado">Diplomado</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                    <option value="Otro">Otro Nivel</option>
                  </select>
                </div>

                {/* Profesión */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Profesión {formSettings.datos_academicos ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={formSettings.datos_academicos}
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="Ej. Abogado, Ing. de Sistemas"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                  />
                </div>

                {/* Universidad de egreso */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Universidad de Egreso {formSettings.datos_academicos ? '*' : '(Opcional)'}
                  </label>
                  <input
                    type="text"
                    required={formSettings.datos_academicos}
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="Ej. UMSA, UAGRM, UCB"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer leading-tight">
                Declaro que toda la información proporcionada es verídica y acepto los términos de posgrado.
              </label>
            </div>

            {/* Submit CTA Button */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <span>Procesando Postulación...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 shrink-0" /> CONFIRMAR Y ENVIAR REGISTRO
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[11px] text-slate-500 pt-1 text-center">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Inscripción Encriptada SSL 256-bit
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Postulación Directa en Sistema
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
