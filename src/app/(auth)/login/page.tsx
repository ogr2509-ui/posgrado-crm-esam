'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@posgrado.com');
  const [password, setPassword] = useState('Admin123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (type: 'ADMIN' | 'ASESOR') => {
    if (type === 'ADMIN') {
      setEmail('admin@posgrado.com');
      setPassword('Admin123!');
    } else {
      setEmail('juan.perez@posgrado.com');
      setPassword('Asesor123!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Posgrado CRM Enterprise</h1>
          <p className="text-xs text-slate-400 font-medium">Plataforma de Inscripciones & Tracking Comercial</p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400">Ingresa tus credenciales de acceso institucional</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@posgrado.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Verificando...' : 'Acceder al Sistema'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Demo Account Quick Select */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Acceso Rápido Demo:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemoAccount('ADMIN')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('ASESOR')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 font-medium transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Asesor (Juan)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
