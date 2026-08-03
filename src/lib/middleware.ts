import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export async function authorizeRequest(
  req: NextRequest,
  allowedRoles?: ('ADMIN' | 'ASESOR')[]
): Promise<{ user: JWTPayload | null; response?: NextResponse }> {
  // Check Authorization header or Cookie
  let token = req.cookies.get('auth_token')?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'No autenticado. Token faltante o inválido.' },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Sesión expirada o token inválido.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
    return {
      user: payload,
      response: NextResponse.json(
        { error: 'Acceso denegado. No tienes permisos para realizar esta acción.' },
        { status: 403 }
      ),
    };
  }

  return { user: payload };
}
