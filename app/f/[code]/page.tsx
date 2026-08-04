import React from 'react';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { PublicRegistrationForm } from '@/components/forms/PublicRegistrationForm';
import { AlertTriangle } from 'lucide-react';

export default async function PublicFormPage({ params }: { params: { code: string } }) {
  const { code } = params;

  try {
    // Failsafe DB auto-initialization for Vercel cold starts
    await ensureDatabaseSeeded();

    const rawCode = decodeURIComponent(code || '').trim();
    const lowerCode = rawCode.toLowerCase();
    const upperCode = rawCode.toUpperCase();
    const slugCode = rawCode.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // 1. LINK LOOKUP (Match link code directly or by prefix)
    let link: any = await prisma.link.findFirst({
      where: {
        OR: [
          { code: { equals: rawCode } },
          { code: { equals: lowerCode } },
          { code: { equals: upperCode } },
          { code: { equals: slugCode } },
          { code: { startsWith: lowerCode } },
          { code: { startsWith: slugCode } },
        ],
      },
      include: {
        program: true,
        advisor: {
          select: { id: true, name: true, phone: true, email: true, active: true },
        },
      },
    });

    // 2. PROGRAM LOOKUP (If link not found by code, match Program code or ID)
    if (!link) {
      const program = await prisma.program.findFirst({
        where: {
          OR: [
            { id: { equals: rawCode } },
            { code: { equals: rawCode } },
            { code: { equals: upperCode } },
            { code: { equals: lowerCode } },
            { code: { equals: slugCode } },
            { code: { startsWith: upperCode } },
            { code: { startsWith: lowerCode } },
          ],
        },
        include: {
          links: {
            take: 1,
            orderBy: { createdAt: 'asc' },
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
          // Auto-create share link bound specifically to THIS program
          let defaultAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
          const advisorIdToUse = defaultAdvisor?.id || 'admin-fallback';

          const createdLink = await prisma.link.create({
            data: {
              code: `${program.code.toLowerCase()}-${Math.floor(100 + Math.random() * 900)}`,
              programId: program.id,
              advisorId: advisorIdToUse,
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

    // 3. FAILSAFE: Load latest active program if code is not found
    if (!link) {
      const latestProgram = await prisma.program.findFirst({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      }) || await prisma.program.findFirst({ orderBy: { createdAt: 'desc' } });

      if (latestProgram) {
        let defaultAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
        link = {
          id: `link-fallback-${latestProgram.id}`,
          code: rawCode,
          advisorId: defaultAdvisor?.id || 'admin-id',
          programId: latestProgram.id,
          active: true,
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          program: latestProgram,
          advisor: defaultAdvisor ? {
            id: defaultAdvisor.id,
            name: defaultAdvisor.name,
            phone: defaultAdvisor.phone,
            email: defaultAdvisor.email,
            active: true,
          } : {
            id: 'admin-id',
            name: 'Asesor Comercial Posgrado',
            phone: '+591 71234567',
            email: 'contacto@posgrado.com',
            active: true,
          },
        };
      }
    }

    // 4. Complete Advisor and Program objects for rendering
    if (link) {
      if (!link.program && link.programId) {
        link.program = await prisma.program.findUnique({ where: { id: link.programId } });
      }

      if (!link.advisor) {
        const activeAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
        link.advisor = activeAdvisor ? {
          id: activeAdvisor.id,
          name: activeAdvisor.name,
          phone: activeAdvisor.phone,
          email: activeAdvisor.email,
          active: true,
        } : {
          id: 'admin-id',
          name: 'Asesor Comercial Posgrado',
          phone: '+591 71234567',
          email: 'contacto@posgrado.com',
          active: true,
        };
      }

      if (link.program) link.program.active = true;
      if (link.advisor) link.advisor.active = true;
      link.active = true;
    }

    // 5. Render Registration Form
    if (link && link.program && link.advisor) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4">
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
    }

    // Fallback UI in rare event no program exists at all
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Enlace No Disponible</h2>
          <p className="text-xs text-slate-400">
            Este programa no se encuentra disponible en este momento.
          </p>
        </div>
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
            El sistema se está actualizando. Por favor actualiza la página o inténtalo nuevamente en unos instantes.
          </p>
        </div>
      </div>
    );
  }
}
