import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded, saveDatabaseSnapshot } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { programSchema } from '@/lib/validations/program';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    await ensureDatabaseSeeded();

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

        let advisorIdToUse = user!.userId;
        const userExists = await prisma.user.findUnique({ where: { id: advisorIdToUse } });
        if (!userExists) {
          const fallbackUser = await prisma.user.findFirst({ where: { active: true } });
          if (fallbackUser) advisorIdToUse = fallbackUser.id;
        }

        const newLink = await prisma.link.create({
          data: {
            code: linkCode,
            programId: prog.id,
            advisorId: advisorIdToUse,
            active: true,
          },
        });

        programs[i].links = [newLink];
      }
    }

    return NextResponse.json({ programs });
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener programas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    await ensureDatabaseSeeded();

    const body = await req.json();
    const validated = programSchema.parse(body);

    const existingCode = await prisma.program.findFirst({
      where: {
        OR: [
          { code: { equals: validated.code.trim().toUpperCase() } },
          { code: { equals: validated.code.trim() } }
        ]
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Ya existe un programa registrado con ese código identificador.' },
        { status: 400 }
      );
    }

    const existingName = await prisma.program.findFirst({
      where: { name: { equals: validated.name.trim() } },
    });

    if (existingName) {
      return NextResponse.json(
        { error: 'Ya existe un programa o curso registrado con ese nombre. Por favor ingresa un nombre único.' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        name: validated.name.trim(),
        code: validated.code.trim().toUpperCase(),
        type: validated.type,
        description: validated.description?.trim() || null,
        imageUrl: validated.imageUrl || null,
        active: validated.active ?? true,
      },
    });

    // Instant Share Link generation for the newly created program
    let linkCode = validated.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existingLink = await prisma.link.findUnique({ where: { code: linkCode } });
    if (existingLink) {
      linkCode = `${linkCode}-${crypto.randomBytes(3).toString('hex')}`;
    }

    let advisorIdToUse = user!.userId;
    const userExists = await prisma.user.findUnique({ where: { id: advisorIdToUse } });
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({ where: { active: true } });
      if (fallbackUser) advisorIdToUse = fallbackUser.id;
    }

    const createdLink = await prisma.link.create({
      data: {
        code: linkCode,
        programId: program.id,
        advisorId: advisorIdToUse,
        active: true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: advisorIdToUse,
          action: 'PROGRAM_CREATED',
          entity: 'Program',
          entityId: program.id,
          details: `Programa "${program.name}" (${program.code}) creado por Admin con enlace de compartir (${createdLink.code})`,
        },
      });
    } catch (e) {}

    // Save snapshot so program persists across serverless lambda containers
    await saveDatabaseSnapshot();

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
    return NextResponse.json({ error: error.message || 'Error al crear programa.' }, { status: 500 });
  }
}
