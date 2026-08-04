import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded, saveDatabaseSnapshot } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { programSchema } from '@/lib/validations/program';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    await ensureDatabaseSeeded();

    const { id } = params;
    const body = await req.json();
    const validated = programSchema.parse(body);

    const program = await prisma.program.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        code: validated.code.trim().toUpperCase(),
        type: validated.type,
        description: validated.description?.trim() || null,
        imageUrl: validated.imageUrl || null,
        active: validated.active,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user!.userId,
          action: 'PROGRAM_UPDATED',
          entity: 'Program',
          entityId: program.id,
          details: `Programa "${program.name}" actualizado por Admin`,
        },
      });
    } catch (e) {}

    await saveDatabaseSnapshot();

    return NextResponse.json({ message: 'Programa actualizado exitosamente.', program });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Error al actualizar programa.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    await ensureDatabaseSeeded();

    const { id } = params;

    // Check if program has registrations
    const regCount = await prisma.registration.count({ where: { programId: id } });
    if (regCount > 0) {
      // Soft delete by deactivating instead of physical delete to preserve data integrity
      const program = await prisma.program.update({
        where: { id },
        data: { active: false },
      });
      await saveDatabaseSnapshot();
      return NextResponse.json({
        message: 'El programa tiene registros asociados y ha sido desactivado.',
        program,
      });
    }

    await prisma.program.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user!.userId,
          action: 'PROGRAM_DELETED',
          entity: 'Program',
          entityId: id,
          details: `Programa eliminado permanentemente`,
        },
      });
    } catch (e) {}

    await saveDatabaseSnapshot();

    return NextResponse.json({ message: 'Programa eliminado correctamente.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar programa.' }, { status: 500 });
  }
}
