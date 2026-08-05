'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  User, Mail, Phone, Shield, KeyRound, Eye, EyeOff, Save, RefreshCw,
  FileText, GraduationCap, Calendar, ChevronDown, ChevronUp, Search,
  CheckCircle2, Clock, XCircle, AlertCircle, TrendingUp, Users, Link2,
  Copy, ExternalLink, Award, Building, Briefcase
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NUEVO:       { label: 'Nuevo Lead',       color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    icon: <AlertCircle className="w-3.5 h-3.5" /> },
  CONTACTADO:  { label: 'Contactado',       color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: <Clock className="w-3.5 h-3.5" /> },
  INTERESADO:  { label: 'Interesado',       color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  INSCRITO:    { label: 'Inscrito',         color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  DESISTIO:    { label: 'Desistió',         color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',    icon: <XCircle className="w-3.5 h-3.5" /> },
};

function RegistrationDetailCard({ reg, isExpanded, onToggle }: { reg: any; isExpanded: boolean; onToggle: () => void }) {
  const status = STATUS_CONFIG[reg.status] || STATUS_CONFIG.NUEVO;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg transition-all">
      {/* Header Row — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/50 transition-colors group"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-500/20">
          {reg.fullName?.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-white text-sm truncate">{reg.fullName}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {reg.program?.name}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(reg.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Detail — full registration form data */}
      {isExpanded && (
        <div className="border-t border-slate-800 p-4 space-y-5 text-xs">
          {/* Section 1: Personal Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> Datos Personales
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Nombre Completo', value: reg.fullName },
                { label: 'C.I.', value: `${reg.ci} ${reg.ciExpedition}` },
                { label: 'Fecha de Nacimiento', value: reg.birthDate ? new Date(reg.birthDate).toLocaleDateString('es-BO') : '-' },
                { label: 'Edad', value: `${reg.age} años` },
                { label: 'Género', value: reg.gender },
                { label: 'Estado Civil', value: reg.civilStatus },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-0.5">
                  <p className="text-slate-400 font-medium text-[10px]">{label}</p>
                  <p className="text-white font-bold truncate">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Datos de Contacto
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Correo Electrónico', value: reg.email },
                { label: 'Celular', value: reg.phone },
                { label: 'WhatsApp', value: reg.whatsapp },
                { label: 'Dirección', value: reg.address },
                { label: 'Ciudad', value: reg.city },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-0.5">
                  <p className="text-slate-400 font-medium text-[10px]">{label}</p>
                  <p className="text-white font-bold truncate">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Academic Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Datos Académicos
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Grado Académico', value: reg.academicDegree },
                { label: 'Profesión', value: reg.profession },
                { label: 'Universidad de Egreso', value: reg.university },
                { label: 'Empresa / Institución', value: reg.company },
                { label: 'Cargo / Posición', value: reg.position },
                { label: 'Años de Experiencia', value: reg.experienceYears ? `${reg.experienceYears} año(s)` : '-' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-0.5">
                  <p className="text-slate-400 font-medium text-[10px]">{label}</p>
                  <p className="text-white font-bold truncate">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Program */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Programa de Interés
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Programa', value: reg.program?.name },
                { label: 'Código', value: reg.program?.code },
                { label: 'Tipo', value: reg.program?.type },
                { label: 'Modalidad', value: reg.modality },
                { label: 'Canal de Captación', value: reg.channel },
                { label: 'Notas', value: reg.notes || 'Sin notas' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-0.5">
                  <p className="text-slate-400 font-medium text-[10px]">{label}</p>
                  <p className="text-white font-bold truncate">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CI Document Preview */}
          {(reg.ciAnversoUrl || reg.ciReversoUrl) && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-400" /> Documentos C.I.
              </h4>
              <div className="flex gap-3 flex-wrap">
                {reg.ciAnversoUrl && (
                  <a
                    href={reg.ciAnversoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold text-[11px] hover:bg-blue-600/20 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Ver C.I. Anverso
                  </a>
                )}
                {reg.ciReversoUrl && (
                  <a
                    href={reg.ciReversoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 font-bold text-[11px] hover:bg-purple-600/20 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Ver C.I. Reverso
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Registration metadata */}
          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-500">
            <span>ID Registro: <span className="font-mono text-slate-400">{reg.id.substring(0, 12)}...</span></span>
            <span>Registrado: {new Date(reg.createdAt).toLocaleString('es-BO')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registrations & Links
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'links'>('registrations');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        fetchRegistrations();
        fetchLinks();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = useCallback(async () => {
    setLoadingRegs(true);
    try {
      const res = await fetch('/api/registrations?take=200');
      const data = await res.json();
      if (res.ok) setRegistrations(data.registrations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      if (res.ok) {
        // Only show links for ACTIVE programs
        const activeLinks = (data.links || []).filter((l: any) => l.program?.active === true);
        setLinks(activeLinks);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/f/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(code);
      toast.success('¡Enlace copiado!', 'El enlace de inscripción fue copiado al portapapeles.');
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name, email: profile.email, phone: profile.phone,
          roleName: profile.role, active: true, password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar la contraseña.');
      toast.success('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente.');
      setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.fullName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.ci?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.program?.name?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) return null;

  const isAdvisor = profile.role === 'ASESOR';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            {profile.name?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/20">
              {profile.role === 'ADMIN' ? '🛡️ Administrador' : '💼 Asesor de Ventas'}
            </span>
            <h1 className="text-xl font-black text-white tracking-tight mt-1">{profile.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
          </div>

          {/* Quick stats for advisors */}
          {isAdvisor && (
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700">
                <p className="text-2xl font-black text-white">{registrations.length}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Leads</p>
              </div>
              <div className="text-center px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700">
                <p className="text-2xl font-black text-emerald-400">
                  {registrations.filter(r => r.status === 'INSCRITO').length}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">Inscritos</p>
              </div>
              <div className="text-center px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700">
                <p className="text-2xl font-black text-blue-400">{links.length}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Programas</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs — only for advisors */}
      {isAdvisor && (
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-full sm:w-auto sm:inline-flex">
          {[
            { id: 'registrations', label: 'Mis Inscripciones', icon: <Users className="w-4 h-4" />, count: registrations.length },
            { id: 'links', label: 'Mis Programas', icon: <Link2 className="w-4 h-4" />, count: links.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* TAB: MY REGISTRATIONS */}
      {isAdvisor && activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, CI, correo o programa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button
              onClick={fetchRegistrations}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRegs ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingRegs ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold text-sm">
                {search ? 'No se encontraron registros con ese criterio.' : 'Aún no tienes inscripciones registradas.'}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Comparte tu enlace de formulario y aquí aparecerán los datos de tus postulantes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRegistrations.map((reg) => (
                <RegistrationDetailCard
                  key={reg.id}
                  reg={reg}
                  isExpanded={expandedId === reg.id}
                  onToggle={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY PROGRAMS & LINKS (active only) */}
      {isAdvisor && activeTab === 'links' && (
        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
              <Link2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold text-sm">No hay programas activos disponibles.</p>
              <p className="text-slate-500 text-xs mt-1">Solicita al administrador que active o cree programas académicos.</p>
            </div>
          ) : (
            links.map((link: any) => (
              <div key={link.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 flex-wrap shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm truncate">{link.program?.name}</p>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase">
                      ● Activo
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase">
                      {link.program?.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">/f/{link.code}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <span className="text-slate-500">Registros:</span>{' '}
                    <strong className="text-white">{link._count?.registrations ?? 0}</strong> postulantes
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyLink(link.code)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      copiedCode === link.code
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                    title="Copiar enlace"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCode === link.code ? '¡Copiado!' : 'Copiar'}
                  </button>
                  <a
                    href={`/f/${link.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/25 transition-all"
                    title="Abrir formulario"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> Información de Cuenta
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            { icon: <User className="w-3.5 h-3.5" />, label: 'Nombre Completo', value: profile.name },
            { icon: <Mail className="w-3.5 h-3.5" />, label: 'Correo Electrónico', value: profile.email },
            { icon: <Phone className="w-3.5 h-3.5" />, label: 'Teléfono / Celular', value: profile.phone || 'No registrado' },
            { icon: <Shield className="w-3.5 h-3.5" />, label: 'Rol de Acceso', value: profile.role === 'ADMIN' ? 'Administrador' : 'Asesor de Ventas' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
              <p className="text-slate-400 flex items-center gap-1.5">{icon} {label}</p>
              <p className="font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" /> Cambiar Contraseña
          </h2>
          <p className="text-xs text-slate-400 mt-1">Actualiza tu contraseña de acceso al sistema. Mínimo 6 caracteres.</p>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Nueva Contraseña *</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Confirmar Nueva Contraseña *</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono ${
                  confirmPassword && newPassword !== confirmPassword ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || !newPassword || newPassword !== confirmPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
