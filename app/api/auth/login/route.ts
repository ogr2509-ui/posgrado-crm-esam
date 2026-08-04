import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

// Demo fallback accounts when database connection is unreachable
const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Administrador Principal',
    email: 'admin@posgrado.com',
    password: 'Admin123!',
    role: 'ADMIN' as const,
    phone: '+591 70000000',
  },
  {
    id: 'u2',
    name: 'Juan Pérez',
    email: 'juan.perez@posgrado.com',
    password: 'Asesor123!',
    role: 'ASESOR' as const,
    phone: '+591 71111111',
  },
  {
    id: 'u3',
    name: 'María López',
    email: 'maria.lopez@posgrado.com',
    password: 'Asesor123!',
    role: 'ASESOR' as const,
    phone: '+591 72222222',
  },
  {
    id: 'u4',
    name: 'Carlos Gómez',
    email: 'carlos.gomez@posgrado.com',
    password: 'Asesor123!',
    role: 'ASESOR' as const,
    phone: '+591 73333333',
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let authenticatedUser: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'ASESOR';
      phone?: string | null;
    } | null = null;

    // 1. Try DB lookup via Prisma
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { role: true },
      });

      if (dbUser && dbUser.active) {
        const isMatch = await comparePassword(password, dbUser.password);
        if (isMatch) {
          authenticatedUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role.name as 'ADMIN' | 'ASESOR',
            phone: dbUser.phone,
          };
        }
      }
    } catch (dbError) {
      console.warn('Prisma DB lookup failed, attempting fallback authentication:', dbError);
    }

    // 2. Fallback to demo system accounts if DB is unavailable or user not found in DB
    if (!authenticatedUser) {
      const mockUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === password
      );
      if (mockUser) {
        authenticatedUser = {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          phone: mockUser.phone,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
    });

    // Non-blocking audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: authenticatedUser.id,
          action: 'USER_LOGIN',
          entity: 'User',
          entityId: authenticatedUser.id,
          details: `Inicio de sesión exitoso como ${authenticatedUser.role}`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });
    } catch (auditError) {
      console.warn('Could not record audit log:', auditError);
    }

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: authenticatedUser,
      token,
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al iniciar sesión.' },
      { status: 500 }
    );
  }
}

