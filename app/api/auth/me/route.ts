import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  const dbUser = await prisma.user.findUnique({
    where: { id: user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      role: { select: { name: true } },
    },
  });

  if (!dbUser || !dbUser.active) {
    return NextResponse.json({ error: 'Usuario no encontrado o inactivo.' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role.name,
    },
  });
}
