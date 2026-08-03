import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const { id } = params;
    const body = await req.json();
    const { active } = body;

    const existingLink = await prisma.link.findUnique({ where: { id } });
    if (!existingLink) {
      return NextResponse.json({ error: 'Enlace no encontrado.' }, { status: 404 });
    }

    // Security check: Advisors can only manage their own links; Admin manages all
    if (user!.role !== 'ADMIN' && existingLink.advisorId !== user!.userId) {
      return NextResponse.json({ error: 'No tienes permiso para modificar este enlace.' }, { status: 403 });
    }

    const updatedLink = await prisma.link.update({
      where: { id },
      data: { active: Boolean(active) },
      include: {
        program: { select: { name: true } },
      },
    });

    return NextResponse.json({ message: 'Estado del enlace actualizado.', link: updatedLink });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar enlace.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const { id } = params;
    const existingLink = await prisma.link.findUnique({ where: { id } });
    if (!existingLink) {
      return NextResponse.json({ error: 'Enlace no encontrado.' }, { status: 404 });
    }

    if (user!.role !== 'ADMIN' && existingLink.advisorId !== user!.userId) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este enlace.' }, { status: 403 });
    }

    await prisma.link.delete({ where: { id } });

    return NextResponse.json({ message: 'Enlace eliminado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar enlace.' }, { status: 500 });
  }
}
