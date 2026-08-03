'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { User, Mail, Phone, Shield, KeyRound, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok) setProfile(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
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
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          roleName: profile.role,
          active: true,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar la contraseña.');

      toast.success('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            {profile.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/20">
              {profile.role === 'ADMIN' ? '🛡️ Administrador' : '💼 Asesor de Ventas'}
            </span>
            <h1 className="text-xl font-black text-white tracking-tight mt-1">{profile.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> Información de Cuenta
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <p className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nombre Completo
            </p>
            <p className="font-bold text-white">{profile.name}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <p className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Correo Electrónico
            </p>
            <p className="font-bold text-white font-mono">{profile.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <p className="text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Teléfono / Celular
            </p>
            <p className="font-bold text-white">{profile.phone || 'No registrado'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
            <p className="text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Rol de Acceso
            </p>
            <p className="font-bold text-white uppercase">{profile.role}</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" /> Cambiar Contraseña
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Actualiza tu contraseña de acceso al sistema. Mínimo 6 caracteres.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              Nueva Contraseña *
            </label>
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
            <label className="font-semibold text-slate-300 block mb-1.5">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-rose-500'
                    : 'border-slate-800'
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
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
