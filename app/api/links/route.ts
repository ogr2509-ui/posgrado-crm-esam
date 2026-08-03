import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const whereCondition = { advisorId: user!.userId };

    const links = await prisma.link.findMany({
      where: whereCondition,
      include: {
        program: { select: { id: true, name: true, code: true, type: true } },
        advisor: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Error al obtener los enlaces.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const body = await req.json();
    const { programId, advisorId } = body;

    if (!programId) {
      return NextResponse.json({ error: 'Debes seleccionar un programa académico.' }, { status: 400 });
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program || !program.active) {
      return NextResponse.json({ error: 'El programa no existe o está inactivo.' }, { status: 404 });
    }

    // Target advisor: If admin provides advisorId, use it; otherwise use current user
    let targetAdvisorId = user!.userId;
    if (user?.role === 'ADMIN' && advisorId) {
      targetAdvisorId = advisorId;
    }

    const advisor = await prisma.user.findUnique({ where: { id: targetAdvisorId } });
    if (!advisor || !advisor.active) {
      return NextResponse.json({ error: 'El asesor de ventas no existe o está inactivo.' }, { status: 404 });
    }

    // Generate unique 10-character code (e.g., 4fd89af8b2)
    const code = crypto.randomBytes(5).toString('hex');

    const link = await prisma.link.create({
      data: {
        code,
        programId: program.id,
        advisorId: targetAdvisorId,
        active: true,
      },
      include: {
        program: { select: { id: true, name: true, code: true, type: true } },
        advisor: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { registrations: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'LINK_CREATED',
        entity: 'Link',
        entityId: link.id,
        details: `Enlace único (${link.code}) generado para el programa ${program.name} asignado a ${advisor.name}`,
      },
    });

    return NextResponse.json({ message: 'Enlace generado exitosamente.', link }, { status: 201 });
  } catch (error) {
    console.error('Error generating link:', error);
    return NextResponse.json({ error: 'Error al generar enlace.' }, { status: 500 });
  }
}
