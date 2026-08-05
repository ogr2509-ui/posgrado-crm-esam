import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '1000', 10);

    // Security Filter: Advisor sees ONLY their own records
    const where: any = {};
    if (user!.role !== 'ADMIN') {
      where.advisorId = user!.userId;
    }

    if (programId && programId !== 'ALL') {
      where.programId = programId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { ci: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (monthParam || yearParam) {
      if (monthParam !== 'ALL' && yearParam !== 'ALL') {
        const now = new Date();
        const m = monthParam ? parseInt(monthParam, 10) : (now.getMonth() + 1);
        const y = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
        if (!isNaN(m) && !isNaN(y)) {
          const startOfM = new Date(y, m - 1, 1, 0, 0, 0, 0);
          const endOfM = new Date(y, m, 0, 23, 59, 59, 999);
          where.createdAt = { gte: startOfM, lte: endOfM };
        }
      }
    } else if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const eod = new Date(endDate);
        eod.setHours(23, 59, 59, 999);
        where.createdAt.lte = eod;
      }
    }

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          program: { select: { id: true, name: true, code: true, type: true } },
          advisor: { select: { id: true, name: true, email: true } },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { changedBy: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.registration.count({ where }),
    ]);

    return NextResponse.json({ registrations, total });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Error al consultar inscripciones.' }, { status: 500 });
  }
}
