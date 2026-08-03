import React from 'react';
import { prisma } from '@/lib/db';
import { PublicRegistrationForm } from '@/components/forms/PublicRegistrationForm';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default async function PublicFormPage({ params }: { params: { code: string } }) {
  const { code } = params;

  // Resolve link data server-side for initial render
  const link = await prisma.link.findUnique({
    where: { code },
    include: {
      program: true,
      advisor: {
        select: { id: true, name: true, phone: true, email: true, active: true },
      },
    },
  });

  if (!link || !link.active || !link.program.active || !link.advisor.active) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Enlace No Disponible</h2>
          <p className="text-xs text-slate-400">
            Este enlace de inscripción ha caducado, ha sido desactivado o el programa no se encuentra disponible en este momento.
          </p>
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              Por favor, contacta directamente con tu asesor de ventas de posgrado para solicitar un nuevo enlace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      {/* Top Branding Nav */}
      <header className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">Posgrado Enterprise</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Portal Oficial de Postulación Estudiantil</p>
          </div>
        </div>
      </header>

      {/* Main Registration Form */}
      <PublicRegistrationForm
        code={code}
        program={{
          id: link.program.id,
          name: link.program.name,
          code: link.program.code,
          type: link.program.type,
          description: link.program.description || undefined,
        }}
        advisor={{
          name: link.advisor.name,
          phone: link.advisor.phone || undefined,
        }}
      />
    </div>
  );
}
