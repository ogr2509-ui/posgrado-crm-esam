import React from 'react';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { PublicRegistrationForm } from '@/components/forms/PublicRegistrationForm';
import { AlertTriangle } from 'lucide-react';

export default async function PublicFormPage({ params }: { params: { code: string } }) {
  const { code } = params;

  try {
    // Failsafe DB auto-initialization for Vercel cold starts
    await ensureDatabaseSeeded();

    const rawCode = (code || '').trim();
    const lowerCode = rawCode.toLowerCase();
    const upperCode = rawCode.toUpperCase();

    // 1. Case-insensitive Link Lookup
    let link: any = await prisma.link.findFirst({
      where: {
        OR: [
          { code: { equals: rawCode } },
          { code: { equals: lowerCode } },
          { code: { equals: upperCode } },
        ],
      },
      include: {
        program: true,
        advisor: {
          select: { id: true, name: true, phone: true, email: true, active: true },
        },
      },
    });

    // 2. Program Code Lookup (If link not found by exact code, search by Program Code)
    if (!link) {
      const program = await prisma.program.findFirst({
        where: {
          OR: [
            { code: { equals: rawCode } },
            { code: { equals: lowerCode } },
            { code: { equals: upperCode } },
            { name: { contains: rawCode } },
          ],
        },
        include: {
          links: {
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
            active: true,
            clickCount: firstLink.clickCount,
            createdAt: firstLink.createdAt,
            updatedAt: firstLink.updatedAt,
            program: program,
            advisor: firstLink.advisor,
          };
        } else {
          // Auto-create a share link for this program on-the-fly
          let defaultAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
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

    // 3. Failsafe advisor check
    if (link) {
      if (!link.advisor) {
        const activeAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
        if (activeAdvisor) {
          link.advisor = {
            id: activeAdvisor.id,
            name: activeAdvisor.name,
            phone: activeAdvisor.phone,
            email: activeAdvisor.email,
            active: true,
          };
        }
      }

      if (link.program) link.program.active = true;
      if (link.advisor) link.advisor.active = true;
      link.active = true;
    }

    // 4. Failsafe check
    if (!link || !link.program || !link.advisor) {
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
