'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Link as LinkIcon,
  Users,
  GraduationCap,
  FileCheck,
  ShieldAlert,
  LogOut,
  Sparkles,
  ChevronRight,
  UserCircle,
  SlidersHorizontal,
} from 'lucide-react';


interface SidebarProps {
  userRole?: 'ADMIN' | 'ASESOR';
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole = 'ASESOR', userName = 'Usuario', userEmail = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'ASESOR'],
    },
    {
      title: 'Inscripciones & Leads',
      href: '/registrations',
      icon: FileCheck,
      roles: ['ADMIN', 'ASESOR'],
    },
    {
      title: 'Mis Enlaces Rastreables',
      href: '/links',
      icon: LinkIcon,
      roles: ['ADMIN', 'ASESOR'],
    },
    {
      title: 'Programas Académicos',
      href: '/programs',
      icon: GraduationCap,
      roles: ['ADMIN'],
    },
    {
      title: 'Asesores & Usuarios',
      href: '/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      title: 'Auditoría & Logs',
      href: '/audit',
      icon: ShieldAlert,
      roles: ['ADMIN'],
    },
    {
      title: 'Config. Formulario',
      href: '/settings/form',
      icon: SlidersHorizontal,
      roles: ['ADMIN'],
    },
  ];


  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 text-slate-300">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">Posgrado CRM</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Enterprise Management</p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="px-5 py-3 border-b border-slate-800/60">
          <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Hora Actual</p>
          <p className="text-sm font-black text-blue-400 font-mono tracking-widest mt-0.5">{currentTime}</p>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Menú Principal
          </div>
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="text-xs">{item.title}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Badge & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <Link
          href="/profile"
          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
            pathname === '/profile'
              ? 'bg-blue-600/10 border-blue-500/20'
              : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 mt-0.5 uppercase">
              {userRole}
            </span>
          </div>
          <UserCircle className="w-4 h-4 text-slate-500 shrink-0" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-rose-900/20 hover:border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
