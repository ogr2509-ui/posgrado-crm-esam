import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { userSchema } from '@/lib/validations/user';
import { RoleName } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        role: { select: { name: true } },
        _count: {
          select: { registrations: true, links: true },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    const body = await req.json();
    const validated = userSchema.parse(body);

    if (!validated.password) {
      return NextResponse.json({ error: 'La contraseña es obligatoria para nuevos usuarios.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo electrónico.' }, { status: 400 });
    }

    let role = await prisma.role.findUnique({
      where: { name: validated.roleName as RoleName },
    });

    if (!role) {
      role = await prisma.role.create({
        data: { name: validated.roleName as RoleName },
      });
    }

    const hashedPassword = await hashPassword(validated.password);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase().trim(),
        password: hashedPassword,
        phone: validated.phone,
        active: validated.active ?? true,
        roleId: role.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: newUser.id,
        details: `Usuario asesor "${newUser.name}" (${newUser.email}) creado por Admin`,
      },
    });

    return NextResponse.json({ message: 'Usuario creado exitosamente.', user: newUser }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error al crear usuario.' }, { status: 500 });
  }
}
