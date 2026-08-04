import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o usuario desactivado.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    const roleName = user.role.name as 'ADMIN' | 'ASESOR';

    const token = await signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `Inicio de sesión exitoso como ${roleName}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        phone: user.phone,
      },
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
