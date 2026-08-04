import React from 'react';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { PublicRegistrationForm } from '@/components/forms/PublicRegistrationForm';
import { AlertTriangle } from 'lucide-react';

export default async function PublicFormPage({ params }: { params: { code: string } }) {
  const { code } = params;

  try {
    // Ensure DB and SQLite tables are initialized on Vercel serverless cold starts
    await ensureDatabaseSeeded();

    const cleanCode = (code || '').trim();

    // 1. Try finding Link directly by code
    let link = await prisma.link.findUnique({
      where: { code: cleanCode },
      include: {
        program: true,
        advisor: {
          select: { id: true, name: true, phone: true, email: true, active: true },
        },
      },
    });

    // 2. If not found by link code, try finding Program by code
    if (!link) {
      const program = await prisma.program.findFirst({
        where: {
          OR: [
            { code: { equals: cleanCode } },
            { code: { equals: cleanCode.toUpperCase() } },
            { code: { equals: cleanCode.toLowerCase() } },
          ],
          active: true,
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

      if (program) {
        if (program.links && program.links.length > 0) {
          const firstLink = program.links[0];
          link = {
            id: firstLink.id,
            code: firstLink.code,
            advisorId: firstLink.advisorId,
            programId: firstLink.programId,
            active: firstLink.active,
            clickCount: firstLink.clickCount,
            createdAt: firstLink.createdAt,
            updatedAt: firstLink.updatedAt,
            program: program,
            advisor: firstLink.advisor,
          };
        } else {
          // Auto-create default link for program if missing
          const defaultAdvisor = await prisma.user.findFirst({ where: { active: true } });
          if (defaultAdvisor) {
            const createdLink = await prisma.link.create({
              data: {
                code: `${program.code.toLowerCase()}-oficial`,
                programId: program.id,
                advisorId: defaultAdvisor.id,
                active: true,
              },
              include: {
                program: true,
                advisor: {
                  select: { id: true, name: true, phone: true, email: true, active: true },
                },
              },
            });
            link = createdLink;
          }
        }
      }
    }

    // 3. Failsafe check with optional chaining
    if (!link || !link.active || !link?.program?.active || !link?.advisor?.active) {
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
          code={link.code}
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
  } catch (error) {
    console.error('Error rendering public registration form page:', error);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Servicio en Actualización</h2>
          <p className="text-xs text-slate-400">
            El sistema se está actualizando en este momento. Por favor actualiza la página o inténtalo nuevamente en unos instantes.
          </p>
        </div>
      </div>
    );
  }
}
