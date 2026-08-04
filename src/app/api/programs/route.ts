import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { programSchema } from '@/lib/validations/program';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    // If advisor, return active programs. If admin, return all programs.
    const whereCondition = user?.role === 'ADMIN' ? {} : { active: true };

    let programs = await prisma.program.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        links: {
          where: { active: true },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { registrations: true, links: true },
        },
      },
    });

    // Ensure every program has at least one active share link
    for (let i = 0; i < programs.length; i++) {
      const prog = programs[i];
      if (!prog.links || prog.links.length === 0) {
        let linkCode = prog.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const existingLink = await prisma.link.findUnique({ where: { code: linkCode } });
        if (existingLink) {
          linkCode = `${linkCode}-${crypto.randomBytes(3).toString('hex')}`;
        }

        const newLink = await prisma.link.create({
          data: {
            code: linkCode,
            programId: prog.id,
            advisorId: user!.userId,
            active: true,
          },
        });

        programs[i].links = [newLink];
      }
    }

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Error al obtener programas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const body = await req.json();
    const validated = programSchema.parse(body);

    const existingCode = await prisma.program.findUnique({
      where: { code: validated.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Ya existe un programa registrado con ese código.' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        name: validated.name,
        code: validated.code,
        type: validated.type,
        description: validated.description,
        imageUrl: validated.imageUrl,
        active: validated.active ?? true,
      },
    });

    // Instant Share Link generation for the newly created program
    let linkCode = validated.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existingLink = await prisma.link.findUnique({ where: { code: linkCode } });
    if (existingLink) {
      linkCode = `${linkCode}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const createdLink = await prisma.link.create({
      data: {
        code: linkCode,
        programId: program.id,
        advisorId: user!.userId,
        active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'PROGRAM_CREATED',
        entity: 'Program',
        entityId: program.id,
        details: `Programa "${program.name}" (${program.code}) creado por Admin con enlace de compartir (${createdLink.code})`,
      },
    });

    const programWithLink = {
      ...program,
      links: [createdLink],
      _count: { registrations: 0, links: 1 },
    };

    return NextResponse.json(
      { message: 'Programa y enlace de compartir creados exitosamente.', program: programWithLink },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Error al crear programa.' }, { status: 500 });
  }
}

