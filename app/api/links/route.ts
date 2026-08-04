import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    // Both advisors and admins view all active program links (admin sees inactive ones too)
    const programWhere = user?.role === 'ADMIN' ? {} : { active: true };

    // Get all programs with their links
    const programs = await prisma.program.findMany({
      where: programWhere,
      orderBy: { createdAt: 'desc' },
      include: {
        links: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          include: {
            advisor: { select: { id: true, name: true, email: true, phone: true } },
            _count: { select: { registrations: true } },
          },
        },
      },
    });

    // Ensure all programs have a Link
    const links: any[] = [];
    for (const prog of programs) {
      let programLink = prog.links[0];

      if (!programLink) {
        let linkCode = prog.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const existingCode = await prisma.link.findUnique({ where: { code: linkCode } });
        if (existingCode) {
          linkCode = `${linkCode}-${crypto.randomBytes(3).toString('hex')}`;
        }

        programLink = await prisma.link.create({
          data: {
            code: linkCode,
            programId: prog.id,
            advisorId: user!.userId,
            active: true,
          },
          include: {
            advisor: { select: { id: true, name: true, email: true, phone: true } },
            _count: { select: { registrations: true } },
          },
        }) as any;
      }

      links.push({
        ...programLink,
        program: { id: prog.id, name: prog.name, code: prog.code, type: prog.type, active: prog.active },
      });
    }

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
    const { programId } = body;

    if (!programId) {
      return NextResponse.json({ error: 'Debes seleccionar un programa académico.' }, { status: 400 });
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program || !program.active) {
      return NextResponse.json({ error: 'El programa no existe o está inactivo.' }, { status: 404 });
    }

    // Check if link for this program already exists
    let existingLink = await prisma.link.findFirst({
      where: { programId: program.id },
      include: {
        program: { select: { id: true, name: true, code: true, type: true } },
        advisor: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (existingLink) {
      return NextResponse.json({ message: 'Enlace del programa obtenido.', link: existingLink });
    }

    // Generate link if none exists
    let code = program.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existingCode = await prisma.link.findUnique({ where: { code } });
    if (existingCode) {
      code = `${code}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const link = await prisma.link.create({
      data: {
        code,
        programId: program.id,
        advisorId: user!.userId,
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
        details: `Enlace único (${link.code}) generado para el programa ${program.name}`,
      },
    });

    return NextResponse.json({ message: 'Enlace generado exitosamente.', link }, { status: 201 });
  } catch (error) {
    console.error('Error generating link:', error);
    return NextResponse.json({ error: 'Error al generar enlace.' }, { status: 500 });
  }
}
