'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Shield } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Panel de Control General',
  '/registrations': 'Gestión de Inscripciones & Leads',
  '/links': 'Enlaces Promocionales Rastreables',
  '/programs': 'Gestión de Oferta Académica',
  '/users': 'Equipo de Ventas & Asesores',
  '/audit': 'Auditoría & Logs del Sistema',
  '/profile': 'Mi Perfil de Usuario',
};

interface NavbarProps {
  title?: string;
  userName?: string;
  userRole?: string;
}

export function Navbar({ title: fallbackTitle = 'Panel de Control', userName = 'Usuario', userRole = 'ASESOR' }: NavbarProps) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);

  const dynamicTitle = PAGE_TITLES[pathname] || fallbackTitle;

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight">{dynamicTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Pill */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/50 uppercase tracking-wider">
          <Shield className="w-3 h-3 text-blue-400" />
          {userRole === 'ADMIN' ? 'Administrador' : 'Asesor de Ventas'}
        </span>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Cambiar tema claro/oscuro"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
