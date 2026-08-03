'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, User, Building, MapPin, GraduationCap, Phone, ShieldCheck, Send } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    fullName: '',
    ci: '',
    ciExpedition: 'LP',
    birthDate: '',
    age: 25,
    gender: 'Masculino',
    civilStatus: 'Soltero(a)',
    profession: '',
    university: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    country: 'Bolivia',
    company: '',
    position: '',
    experienceYears: 3,
    modality: 'VIRTUAL',
    channel: 'WhatsApp / Redes Sociales',
    notes: '',
    termsAccepted: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Front-end age validation check
    if (formData.age < 18) {
      setError('Debes ser mayor de 18 años para inscribirte a un programa de posgrado.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/public/form/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ¡Inscripción Registrada con Éxito!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Hemos recibido correctamente tu postulación para el programa{' '}
            <strong className="text-blue-600 dark:text-blue-400">{program.name}</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1 text-slate-600 dark:text-slate-300">
          <p><strong>Asesor Asignado:</strong> {advisor.name}</p>
          {advisor.phone && <p><strong>Teléfono Directo:</strong> {advisor.phone}</p>}
          <p className="pt-2 text-[11px] text-slate-500">
            * Te contactaremos a la brevedad posible a tu celular y correo electrónico con los detalles del inicio de clases y requisitos.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          Enviar otra postulación
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Formulario Oficial de Inscripcion
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Completa tus datos personales y academicos para registrar tu postulacion al programa.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <User className="w-4 h-4 text-blue-500" />
          <span>Asesor Comercial Asignado: <strong>{advisor.name}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left 50%: Program Title FIRST, followed by Program Image */}
        <div className="lg:sticky lg:top-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl space-y-6 overflow-hidden relative">
          <div className="relative z-10 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-blue-300 uppercase tracking-wider">
              {program.code} &middot; {program.type}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{program.name}</h2>
            {program.description && (
              <p className="text-xs text-slate-300 leading-relaxed">{program.description}</p>
            )}
          </div>

          {program.imageUrl && (
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <img
                src={program.imageUrl}
                alt={program.name}
                className="w-full h-auto max-h-[580px] object-cover object-center"
              />
            </div>
          )}
        </div>

      {/* Right 50%: Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

      {/* Section 1: Personal Info */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-blue-500" /> 1. Datos Personales de Identidad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nombre Completo (Como figura en tu C.I.) *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej. Roberto Vargas Morales"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Cédula de Identidad (CI) *
            </label>
            <input
              type="text"
              required
              value={formData.ci}
              onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
              placeholder="Ej. 7654321"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Lugar de Expedición *
            </label>
            <select
              value={formData.ciExpedition}
              onChange={(e) => setFormData({ ...formData, ciExpedition: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            >
              <option value="LP">La Paz (LP)</option>
              <option value="CB">Cochabamba (CB)</option>
              <option value="SC">Santa Cruz (SC)</option>
              <option value="OR">Oruro (OR)</option>
              <option value="PT">Potosí (PT)</option>
              <option value="TJ">Tarija (TJ)</option>
              <option value="CH">Chuquisaca (CH)</option>
              <option value="BE">Beni (BE)</option>
              <option value="PA">Pando (PA)</option>
              <option value="Extranjero">Extranjero</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              required
              value={formData.birthDate}
              onChange={handleDateChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Edad Calculada (Mínimo 18 años)
            </label>
            <input
              type="number"
              readOnly
              value={formData.age}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200/60 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Sexo *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Estado Civil *</label>
            <select
              value={formData.civilStatus}
              onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            >
              <option value="Soltero(a)">Soltero(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viudo(a)">Viudo(a)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Contact & Address */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
          <Phone className="w-4 h-4 text-indigo-500" /> 2. Datos de Contacto y Residencia
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="estudiante@ejemplo.com"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Celular (Solo Números) *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+]/g, '') })}
              placeholder="77889900"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              WhatsApp Activo *
            </label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/[^0-9+]/g, '') })}
              placeholder="77889900"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Dirección de Domicilio *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Principal 123"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ciudad *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ej. La Paz"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Departamento / Estado *</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Ej. La Paz"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Professional & Work */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
          <GraduationCap className="w-4 h-4 text-emerald-500" /> 3. Perfil Académico y Experiencia Laboral
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Profesión u Ocupación *
            </label>
            <input
              type="text"
              required
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Ej. Licenciado en Administración"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Universidad de Procedencia *
            </label>
            <input
              type="text"
              required
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              placeholder="Ej. UMSA / UCB / UAGRM"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Empresa donde trabaja *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nombre de la empresa"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Cargo / Puesto Actual *
            </label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Ej. Gerente de Proyectos"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Años de Experiencia *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Modalidad de Preferencia *
            </label>
            <select
              value={formData.modality}
              onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold"
            >
              <option value="VIRTUAL">Virtual / En Línea</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="SEMIPRESENCIAL">Semipresencial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Preferences & Terms */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            ¿Cómo conoció este programa de posgrado? *
          </label>
          <input
            type="text"
            required
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
            placeholder="Ej. Facebook, WhatsApp, Recomendación, LinkedIn"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Observaciones o Consultas Adicionales
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Comentarios sobre horarios, planes de pago..."
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            required
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
          />
          <label htmlFor="terms" className="text-slate-600 dark:text-slate-400 font-medium">
            Declaro que toda la información consignada es verídica y acepto los términos y condiciones de tratamiento de datos personales para la postulación a este programa académico.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Procesando Inscripción...' : 'Enviar Formulario de Inscripción'}
        </button>
      </div>
    </form>
    </div>
  );
}
