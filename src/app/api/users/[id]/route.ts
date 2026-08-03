import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { RoleName } from '@prisma/client';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const { id } = params;
    const body = await req.json();
    const { name, email, password, phone, roleName, active } = body;

    const updateData: any = {
      name,
      email: email ? email.toLowerCase().trim() : undefined,
      phone,
      active,
    };

    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password);
    }

    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName as RoleName } });
      if (role) updateData.roleId = role.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        role: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: id,
        details: `Usuario "${updatedUser.name}" actualizado por Admin`,
      },
    });

    return NextResponse.json({ message: 'Usuario actualizado correctamente.', user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const { id } = params;

    // Check if user has associated registrations or links
    const [regCount, linkCount] = await Promise.all([
      prisma.registration.count({ where: { advisorId: id } }),
      prisma.link.count({ where: { advisorId: id } }),
    ]);

    if (regCount > 0 || linkCount > 0) {
      // Soft delete/deactivate to preserve audit and sales lead integrity
      const deactivatedUser = await prisma.user.update({
        where: { id },
        data: { active: false },
      });

      await prisma.auditLog.create({
        data: {
          userId: user!.userId,
          action: 'USER_DEACTIVATED',
          entity: 'User',
          entityId: id,
          details: `Usuario "${deactivatedUser.name}" desactivado (posee ${regCount} leads / ${linkCount} enlaces asociados)`,
        },
      });

      return NextResponse.json({
        message: `El usuario posee ${regCount} prospectos y ${linkCount} enlaces registrados. Ha sido deshabilitado de forma segura.`,
        deactivated: true,
      });
    }

    // Hard delete if no associated commercial data
    const deletedUser = await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: id,
        details: `Usuario "${deletedUser.name}" eliminado permanentemente`,
      },
    });

    return NextResponse.json({ message: 'Usuario eliminado permanentemente.', deleted: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario.' }, { status: 500 });
  }
}
