import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const { response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '50', 10);

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (search.trim()) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Get distinct actions for filter dropdown
    const actionsRaw = await prisma.auditLog.groupBy({
      by: ['action'],
      orderBy: { action: 'asc' },
    });
    const availableActions = actionsRaw.map((a) => a.action);

    return NextResponse.json({ logs, total, availableActions });
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar logs de auditoría.' }, { status: 500 });
  }
}
