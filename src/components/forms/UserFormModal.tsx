'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { KeyRound, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface UserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  roleName: 'ADMIN' | 'ASESOR';
  active: boolean;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: UserData | null;
  onUserSaved: () => void;
}

export function UserFormModal({
  isOpen,
  onClose,
  userToEdit,
  onUserSaved,
}: UserFormModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [roleName, setRoleName] = useState<'ADMIN' | 'ASESOR'>('ASESOR');
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setPhone(userToEdit.phone || '');
      setRoleName(userToEdit.roleName || 'ASESOR');
      setActive(userToEdit.active ?? true);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRoleName('ASESOR');
      setActive(true);
      generatePassword();
    }
    setError(null);
    setCopied(false);
  }, [userToEdit, isOpen]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let newPass = 'Ventas2026!';
    for (let i = 0; i < 4; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
  };

  const copyCredentials = () => {
    const creds = `Credenciales de Acceso Posgrado CRM:\nUsuario/Correo: ${email}\nContraseña: ${password}\nRol: ${roleName === 'ASESOR' ? 'Asesor de Ventas' : 'Administrador'}`;
    navigator.clipboard.writeText(creds);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = userToEdit ? `/api/users/${userToEdit.id}` : '/api/users';
      const method = userToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, roleName, active }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar usuario.');

      toast.success(
        userToEdit ? 'Usuario actualizado' : 'Usuario creado exitosamente',
        userToEdit ? `Los datos de ${name} han sido actualizados.` : `${name} ya puede iniciar sesión en el sistema.`
      );
      onUserSaved();
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al guardar', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? 'Editar Usuario / Asesor' : 'Nuevo Asesor de Ventas'}
      subtitle="Asigne credenciales de acceso, contraseñas y permisos del área comercial"
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
            Nombre Completo del Asesor *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez u María López"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Correo Electrónico (Usuario de Acceso) *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan.perez@posgrado.com"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              {userToEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
            </label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-[11px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3" /> Generar Segura
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required={!userToEdit}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={userToEdit ? 'Dejar en blanco para mantener contraseña actual' : 'Mínimo 6 caracteres'}
              className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {password && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Contraseña actual: <strong className="font-mono text-blue-500 dark:text-blue-400">{password}</strong>
            </span>
            <button
              type="button"
              onClick={copyCredentials}
              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? '¡Copiado!' : 'Copiar Credenciales'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Teléfono / Celular
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+591 71234567"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rol de Usuario *
            </label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ASESOR">💼 Asesor de Ventas</option>
              <option value="ADMIN">🛡️ Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="active-user"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="active-user" className="font-semibold text-slate-700 dark:text-slate-300">
            Usuario Habilitado (Permite iniciar sesión en el CRM)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 shadow-md shadow-blue-500/20"
          >
            {isLoading ? 'Guardando...' : userToEdit ? 'Actualizar Usuario' : 'Crear Usuario de Ventas'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
