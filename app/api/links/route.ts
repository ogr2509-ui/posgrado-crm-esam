import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const isAdmin = user?.role === 'ADMIN';

    // Only fetch active programs for advisors; admins see everything
    const programs = await prisma.program.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: { createdAt: 'desc' },
    });

    const links: any[] = [];

    for (const prog of programs) {
      let programLink: any;

      if (isAdmin) {
        // Admin sees the first/generic link for each program
        programLink = await prisma.link.findFirst({
          where: { programId: prog.id },
          orderBy: { createdAt: 'asc' },
          include: {
            advisor: { select: { id: true, name: true, email: true, phone: true } },
            _count: { select: { registrations: true } },
          },
        });
      } else {
        // ADVISOR: look for their OWN personal link for this program
        programLink = await prisma.link.findFirst({
          where: {
            programId: prog.id,
            advisorId: user!.userId,
          },
          orderBy: { createdAt: 'asc' },
          include: {
            advisor: { select: { id: true, name: true, email: true, phone: true } },
            _count: { select: { registrations: true } },
          },
        });
      }

      // If no personal link exists for this advisor+program, create one automatically
      if (!programLink) {
        const advisorIdToUse = user!.userId;

        // Generate a unique link code specific to this advisor
        let baseCode = prog.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        let linkCode = baseCode;

        // If not admin, append a suffix based on advisor identity to avoid collisions
        if (!isAdmin) {
          const suffix = crypto.createHash('md5').update(advisorIdToUse).digest('hex').substring(0, 4);
          linkCode = `${baseCode}-${suffix}`;
        }

        // Ensure the code is unique in the database
        const existingCode = await prisma.link.findUnique({ where: { code: linkCode } });
        if (existingCode) {
          linkCode = `${linkCode}-${crypto.randomBytes(3).toString('hex')}`;
        }

        programLink = await prisma.link.create({
          data: {
            code: linkCode,
            programId: prog.id,
            advisorId: advisorIdToUse,
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
        program: {
          id: prog.id,
          name: prog.name,
          code: prog.code,
          type: prog.type,
          active: prog.active,
        },
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

    const program = await prisma.program.findUnique({ where: { id: programId } });

    if (!program || !program.active) {
      return NextResponse.json({ error: 'El programa no existe o está inactivo.' }, { status: 404 });
    }

    // Check if THIS advisor already has a link for this program
    const existingLink = await prisma.link.findFirst({
      where: { programId: program.id, advisorId: user!.userId },
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

    // Generate a personal link code for this advisor+program
    let baseCode = program.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const suffix = crypto.createHash('md5').update(user!.userId).digest('hex').substring(0, 4);
    let code = `${baseCode}-${suffix}`;

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

    try {
      await prisma.auditLog.create({
        data: {
          userId: user!.userId,
          action: 'LINK_CREATED',
          entity: 'Link',
          entityId: link.id,
          details: `Enlace personal (${link.code}) generado para el programa ${program.name} por ${link.advisor?.name}`,
        },
      });
    } catch (e) {}

    return NextResponse.json({ message: 'Enlace generado exitosamente.', link }, { status: 201 });
  } catch (error) {
    console.error('Error generating link:', error);
    return NextResponse.json({ error: 'Error al generar enlace.' }, { status: 500 });
  }
}
