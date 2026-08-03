'use client';

import React, { useState, useEffect } from 'react';
import { UserFormModal } from '@/components/forms/UserFormModal';
import { Users, Plus, Edit, Trash2, Power, Shield, Phone, Mail, UserCheck, UserX, Search, Copy, Check } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserActive = async (user: any) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          roleName: user.role?.name,
          active: !user.active,
        }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const deactivateUser = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const copyUserEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'ALL' || u.role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const totalAdvisors = users.filter((u) => u.role?.name === 'ASESOR').length;
  const activeUsers = users.filter((u) => u.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase border border-indigo-500/20">
              Área Comercial & Usuarios
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Equipo de Ventas y Accesos</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generación de cuentas para asesores comerciales, contraseñas de acceso y control de habilitación.
          </p>
        </div>

        <button
          onClick={() => {
            setUserToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Crear Asesor de Ventas
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Asesores de Ventas</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalAdvisors}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5 mx-auto" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Usuarios Habilitados</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{activeUsers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5 mx-auto" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Cuentas</p>
            <p className="text-2xl font-black text-indigo-400 mt-0.5">{totalUsers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5 mx-auto" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre, Email o Teléfono..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todos los Roles' },
            { id: 'ASESOR', label: '💼 Asesores de Ventas' },
            { id: 'ADMIN', label: '🛡️ Administradores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roleFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/80 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Usuario / Asesor</th>
                <th className="p-4 font-semibold">Teléfono / Celular</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Métricas de Ventas</th>
                <th className="p-4 font-semibold">Estado de Acceso</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    Cargando equipo comercial...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                            {u.name}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <span>{u.email}</span>
                            <button
                              onClick={() => copyUserEmail(u.email, u.id)}
                              className="text-slate-500 hover:text-slate-200 ml-1"
                              title="Copiar correo"
                            >
                              {copiedId === u.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">
                      {u.phone ? (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {u.phone}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No registrado</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                          u.role?.name === 'ADMIN'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800/80'
                            : 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                        }`}
                      >
                        {u.role?.name === 'ADMIN' ? '🛡️ Admin' : '💼 Sales / Asesor'}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-400 font-bold">
                          {u._count?.registrations || 0} leads
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({u._count?.links || 0} enlaces)
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleUserActive(u)}
                        title={u.active ? 'Clic para Deshabilitar acceso' : 'Clic para Habilitar acceso'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                          u.active
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-rose-950/80 hover:text-rose-400 hover:border-rose-800'
                            : 'bg-rose-950/80 text-rose-400 border-rose-800 hover:bg-emerald-950/80 hover:text-emerald-400 hover:border-emerald-800'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {u.active ? 'Habilitado' : 'Deshabilitado'}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setUserToEdit({
                            id: u.id,
                            name: u.name,
                            email: u.email,
                            phone: u.phone,
                            roleName: u.role?.name,
                            active: u.active,
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Editar credenciales y datos"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deactivateUser(u.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                    No se encontraron usuarios o asesores de ventas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        onUserSaved={() => {
          setIsModalOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}
