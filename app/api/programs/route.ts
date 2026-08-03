import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { programSchema } from '@/lib/validations/program';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    // If advisor, return active programs. If admin, return all programs.
    const whereCondition = user?.role === 'ADMIN' ? {} : { active: true };

    const programs = await prisma.program.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { registrations: true, links: true },
        },
      },
    });

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
        active: validated.active ?? true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'PROGRAM_CREATED',
        entity: 'Program',
        entityId: program.id,
        details: `Programa "${program.name}" (${program.code}) creado por Admin`,
      },
    });

    return NextResponse.json({ message: 'Programa creado exitosamente.', program }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Error al crear programa.' }, { status: 500 });
  }
}
