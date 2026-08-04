import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';

const DEFAULT_SETTINGS: Record<string, boolean> = {
  datos_personales: true,
  documentos_ci: true,
  datos_contacto: true,
  datos_academicos: true,
};

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const settings = await prisma.formSetting.findMany();
    const result: Record<string, boolean> = { ...DEFAULT_SETTINGS };

    settings.forEach((s) => {
      result[s.sectionKey] = s.isMandatory;
    });

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('Error fetching form settings:', error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await authorizeRequest(req, ['ADMIN']);
  if (response) return response;

  try {
    await ensureDatabaseSeeded();

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Configuración inválida.' }, { status: 400 });
    }

    for (const key of Object.keys(settings)) {
      const isMandatory = Boolean(settings[key]);
      await prisma.formSetting.upsert({
        where: { sectionKey: key },
        update: { isMandatory },
        create: { sectionKey: key, isMandatory },
      });
    }

    let currentUserId = user!.userId;
    const currentUserExists = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUserExists) {
      const anyAdmin = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
      if (anyAdmin) currentUserId = anyAdmin.id;
    }

    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUserId,
          action: 'FORM_SETTINGS_UPDATED',
          entity: 'FormSetting',
          details: `Configuración de obligatoriedad del formulario pública actualizada por Administrador.`,
        },
      });
    } catch (e) {
      console.error('Audit log ignored:', e);
    }

    return NextResponse.json({ message: 'Configuración guardada exitosamente.', settings });
  } catch (error) {
    console.error('Error updating form settings:', error);
    return NextResponse.json({ error: 'Error al guardar la configuración.' }, { status: 500 });
  }
}
