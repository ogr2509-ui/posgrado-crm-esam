import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const isAdvisor = user!.role !== 'ADMIN';
    const advisorCondition = isAdvisor ? { advisorId: user!.userId } : {};

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Counts
    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      prisma.registration.count({ where: { ...advisorCondition, createdAt: { gte: startOfToday } } }),
      prisma.registration.count({ where: { ...advisorCondition, createdAt: { gte: startOfWeek } } }),
      prisma.registration.count({ where: { ...advisorCondition, createdAt: { gte: startOfMonth } } }),
      prisma.registration.count({ where: advisorCondition }),
    ]);

    // Status Funnel Breakdowns
    const statusCounts = await prisma.registration.groupBy({
      by: ['status'],
      where: advisorCondition,
      _count: { status: true },
    });

    const funnelMap: Record<string, number> = {
      NUEVO: 0,
      CONTACTADO: 0,
      DOC_PENDIENTE: 0,
      COMPLETO: 0,
      MATRICULADO: 0,
      DESCARTADO: 0,
    };

    statusCounts.forEach((s) => {
      funnelMap[s.status] = s._count.status;
    });

    // Registrations by Program
    const registrationsByProgramRaw = await prisma.registration.groupBy({
      by: ['programId'],
      where: advisorCondition,
      _count: { id: true },
    });

    const programIds = registrationsByProgramRaw.map((p) => p.programId);
    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true, code: true },
    });

    const programMap = new Map(programs.map((p) => [p.id, p.name]));
    const byProgram = registrationsByProgramRaw.map((p) => ({
      programName: programMap.get(p.programId) || 'Desconocido',
      count: p._count.id,
    }));

    // Admin Specific Aggregates
    let topAdvisors: Array<{ id: string; name: string; email: string; totalLeads: number; matriculados: number }> = [];

    if (!isAdvisor) {
      const advisorsWithLeads = await prisma.user.findMany({
        where: { role: { name: 'ASESOR' } },
        select: {
          id: true,
          name: true,
          email: true,
          registrations: {
            select: { status: true },
          },
        },
      });

      topAdvisors = advisorsWithLeads
        .map((adv) => {
          const totalLeads = adv.registrations.length;
          const matriculados = adv.registrations.filter((r) => r.status === 'MATRICULADO').length;
          return {
            id: adv.id,
            name: adv.name,
            email: adv.email,
            totalLeads,
            matriculados,
          };
        })
        .sort((a, b) => b.totalLeads - a.totalLeads)
        .slice(0, 5);
    }

    return NextResponse.json({
      kpis: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        total: totalCount,
      },
      funnel: [
        { status: 'Nuevo', count: funnelMap.NUEVO, fill: '#3b82f6' },
        { status: 'Contactado', count: funnelMap.CONTACTADO, fill: '#6366f1' },
        { status: 'Doc. Pendiente', count: funnelMap.DOC_PENDIENTE, fill: '#eab308' },
        { status: 'Inscripción Completa', count: funnelMap.COMPLETO, fill: '#06b6d4' },
        { status: 'Matriculado', count: funnelMap.MATRICULADO, fill: '#22c55e' },
        { status: 'Descartado', count: funnelMap.DESCARTADO, fill: '#ef4444' },
      ],
      byProgram,
      topAdvisors,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Error al cargar estadísticas.' }, { status: 500 });
  }
}
