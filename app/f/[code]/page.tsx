import React from 'react';
import { prisma } from '@/lib/db';
import { PublicRegistrationForm } from '@/components/forms/PublicRegistrationForm';
import { AlertTriangle } from 'lucide-react';

export default async function PublicFormPage({ params }: { params: { code: string } }) {
  const { code } = params;

  // Resolve link data server-side for initial render
  let link = await prisma.link.findUnique({
    where: { code },
    include: {
      program: true,
      advisor: {
        select: { id: true, name: true, phone: true, email: true, active: true },
      },
    },
  });

  if (!link) {
    const program = await prisma.program.findFirst({
      where: {
        OR: [
          { code: { equals: code } },
          { code: { equals: code.toUpperCase() } },
        ],
      },
      include: {
        links: {
          where: { active: true },
          take: 1,
          include: {
            advisor: {
              select: { id: true, name: true, phone: true, email: true, active: true },
            },
          },
        },
      },
    });

    if (program && program.links.length > 0) {
      link = {
        ...program.links[0],
        program,
      };
    }
  }

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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4">
      {/* Main Registration Form */}
      <PublicRegistrationForm
        code={code}
        program={{
          id: link.program.id,
          name: link.program.name,
          code: link.program.code,
          type: link.program.type,
          description: link.program.description || undefined,
          imageUrl: link.program.imageUrl || undefined,
        }}
        advisor={{
          name: link.advisor.name,
          phone: link.advisor.phone || undefined,
        }}
      />
    </div>
  );
}
