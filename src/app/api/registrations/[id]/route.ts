import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { RegistrationStatus } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const { id } = params;

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        program: true,
        advisor: { select: { id: true, name: true, email: true, phone: true } },
        link: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { name: true, email: true } } },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Inscripción no encontrada.' }, { status: 404 });
    }

    // Security check: Advisor can only access their own registration
    if (user!.role !== 'ADMIN' && registration.advisorId !== user!.userId) {
      return NextResponse.json({ error: 'Acceso denegado a este registro.' }, { status: 403 });
    }

    return NextResponse.json({ registration });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la inscripción.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const { id } = params;
    const body = await req.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json({ error: 'El nuevo estado es obligatorio.' }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: 'Inscripción no encontrada.' }, { status: 404 });
    }

    // Security check: Advisor can only update their own leads
    if (user!.role !== 'ADMIN' && registration.advisorId !== user!.userId) {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    const previousStatus = registration.status;
    const newStatus = status as RegistrationStatus;

    // Update status and append status history entry
    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            previousStatus,
            newStatus,
            changedById: user!.userId,
            note: note || `Estado actualizado a ${newStatus}`,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { name: true } } },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'STATUS_UPDATED',
        entity: 'Registration',
        entityId: id,
        details: `Estado cambiado de ${previousStatus} a ${newStatus}. Nota: ${note || 'Sin nota'}`,
      },
    });

    return NextResponse.json({
      message: `Estado actualizado correctamente a ${newStatus}`,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const { id } = params;

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json({ error: 'Inscripción no encontrada.' }, { status: 404 });
    }

    // Cascade delete: StatusHistory is deleted via Cascade relation in schema
    await prisma.registration.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'REGISTRATION_DELETED',
        entity: 'Registration',
        entityId: id,
        details: `Inscripción de "${registration.fullName}" eliminada permanentemente por Admin`,
      },
    });

    return NextResponse.json({ message: 'Inscripción eliminada correctamente.' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ error: 'Error al eliminar la inscripción.' }, { status: 500 });
  }
}
