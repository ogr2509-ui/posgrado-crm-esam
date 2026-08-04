import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { registrationSchema } from '@/lib/validations/registration';
import { RegistrationStatus, Modality } from '@prisma/client';
import { CRMIntegrationService } from '@/lib/crm-service';

async function getLinkByCode(code: string) {
  let link = await prisma.link.findUnique({
    where: { code },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          description: true,
          active: true,
        },
      },
      advisor: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          active: true,
        },
      },
    },
  });

  if (!link) {
    const program = await prisma.program.findFirst({
      where: {
        OR: [
          { code: { equals: code } },
          { code: { equals: code.toUpperCase() } },
        ],
      },
      include: {
        links: {
          where: { active: true },
          take: 1,
          include: {
            advisor: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                active: true,
              },
            },
          },
        },
      },
    });

    if (program && program.links.length > 0) {
      link = {
        ...program.links[0],
        program: {
          id: program.id,
          name: program.name,
          code: program.code,
          type: program.type,
          description: program.description,
          active: program.active,
        },
      };
    }
  }

  return link;
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const link = await getLinkByCode(code);

    if (!link || !link.active || !link.program.active || !link.advisor.active) {
      return NextResponse.json(
        { error: 'El enlace de inscripción no está disponible o ha sido desactivado.' },
        { status: 404 }
      );
    }

    await prisma.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    });

    return NextResponse.json({
      valid: true,
      program: link.program,
      advisor: {
        name: link.advisor.name,
        phone: link.advisor.phone,
      },
    });
  } catch (error) {
    console.error('Error fetching public link:', error);
    return NextResponse.json(
      { error: 'Error al consultar información del formulario.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const link = await getLinkByCode(code);

    if (!link || !link.active || !link.program.active || !link.advisor.active) {
      return NextResponse.json(
        { error: 'El enlace de inscripción no es válido o ha caducado.' },
        { status: 404 }
      );
    }

    const formSettings = await prisma.formSetting.findMany();
    const settingsMap: Record<string, boolean> = {
      datos_personales: true,
      documentos_ci: true,
      datos_contacto: true,
      datos_academicos: true,
    };
    formSettings.forEach((s) => {
      settingsMap[s.sectionKey] = s.isMandatory;
    });

    const body = await req.json();

    // Default fallbacks for optional fields if Admin disabled section mandatory requirement
    if (!settingsMap.datos_personales) {
      if (!body.firstName) body.firstName = 'Postulante';
      if (!body.lastName) body.lastName = 'Registrado';
      if (!body.ci) body.ci = `CI-${Date.now().toString().slice(-6)}`;
      if (!body.birthDate) body.birthDate = '1995-01-01';
      if (!body.address) body.address = 'Sin Especificar';
      if (!body.city) body.city = 'La Paz';
    }

    if (!settingsMap.datos_contacto) {
      if (!body.email) body.email = `postulante.${Date.now()}@posgrado.com`;
      if (!body.phone) body.phone = '70000000';
    }

    if (!settingsMap.datos_academicos) {
      if (!body.profession) body.profession = 'Profesional';
      if (!body.university) body.university = 'Universidad';
      if (!body.academicDegree) body.academicDegree = 'Licenciatura';
    }

    const validated = registrationSchema.parse(body);

    // Dynamic check for C.I. documents mandatory setting
    if (settingsMap.documentos_ci && !validated.ciAnversoUrl) {
      return NextResponse.json(
        { error: 'La fotografía/documento de C.I. Anverso es obligatoria.' },
        { status: 400 }
      );
    }

    // Anti-duplicate check: Same email registered for the SAME program
    const duplicateEmail = await prisma.registration.findFirst({
      where: {
        email: validated.email.toLowerCase().trim(),
        programId: link.programId,
      },
    });

    if (duplicateEmail) {
      return NextResponse.json(
        {
          error:
            'Ya existe una inscripción registrada con este correo electrónico para el programa seleccionado.',
        },
        { status: 400 }
      );
    }

    // Anti-duplicate check: Same CI registered for the SAME program
    const duplicateCI = await prisma.registration.findFirst({
      where: {
        ci: validated.ci.trim(),
        programId: link.programId,
      },
    });

    if (duplicateCI) {
      return NextResponse.json(
        {
          error:
            'Ya existe una inscripción registrada con este número de cédula de identidad para el programa seleccionado.',
        },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const fullName = validated.fullName?.trim() || `${validated.firstName.trim()} ${validated.lastName.trim()}`;

    const registration = await prisma.registration.create({
      data: {
        linkId: link.id,
        advisorId: link.advisorId,
        programId: link.programId,

        fullName,
        firstName: validated.firstName.trim(),
        lastName: validated.lastName.trim(),
        ci: validated.ci.trim(),
        ciExpedition: validated.ciExpedition,
        birthDate: new Date(validated.birthDate),
        age: validated.age,
        gender: validated.gender,
        civilStatus: validated.civilStatus,
        ciAnversoUrl: validated.ciAnversoUrl || null,
        ciReversoUrl: validated.ciReversoUrl || null,

        academicDegree: validated.academicDegree,
        profession: validated.profession.trim(),
        university: validated.university.trim(),
        email: validated.email.toLowerCase().trim(),
        phone: validated.phone.trim(),
        whatsapp: validated.whatsapp ? validated.whatsapp.trim() : validated.phone.trim(),
        address: validated.address.trim(),
        city: validated.city.trim(),
        state: validated.state?.trim() || validated.city.trim(),
        country: validated.country?.trim() || 'Bolivia',

        company: validated.company?.trim() || 'Particular',
        position: validated.position?.trim() || 'Profesional Independiente',
        experienceYears: validated.experienceYears ?? 1,

        modality: (validated.modality || 'VIRTUAL') as Modality,
        channel: validated.channel || 'Formulario Web',
        notes: validated.notes?.trim() || null,
        termsAccepted: true,

        status: 'NUEVO',
        ipAddress: clientIp,
      },
    });

    // Record initial status history entry
    await prisma.statusHistory.create({
      data: {
        registrationId: registration.id,
        previousStatus: 'NUEVO',
        newStatus: 'NUEVO',
        changedById: link.advisorId,
        note: 'Registro enviado por el estudiante a través del formulario público.',
      },
    });

    // Record Audit log
    await prisma.auditLog.create({
      data: {
        userId: link.advisorId,
        action: 'PUBLIC_STUDENT_REGISTRATION',
        entity: 'Registration',
        entityId: registration.id,
        details: `Nuevo estudiante registrado: ${registration.fullName} (${registration.email})`,
        ipAddress: clientIp,
      },
    });

    // Trigger non-blocking CRM & WhatsApp Notification integrations
    CRMIntegrationService.sendWhatsAppNotification({
      toPhone: link.advisor.phone || '',
      studentName: registration.fullName,
      programName: link.program.name,
      advisorName: link.advisor.name,
    }).catch(console.error);

    return NextResponse.json(
      {
        message: '¡Inscripción registrada con éxito! Tu asesor de ventas se pondrá en contacto a la brevedad.',
        registrationId: registration.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error submitting student registration:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la inscripción. Inténtalo nuevamente.' },
      { status: 500 }
    );
  }
}
