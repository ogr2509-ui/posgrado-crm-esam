import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { registrationSchema } from '@/lib/validations/registration';
import { RegistrationStatus, Modality } from '@prisma/client';
import { CRMIntegrationService } from '@/lib/crm-service';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    const link = await prisma.link.findUnique({
      where: { code },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            description: true,
          },
        },
        advisor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!link || !link.active || !link.program.active || !link.advisor.active) {
      return NextResponse.json(
        { error: 'El enlace de inscripción no está disponible o ha sido desactivado.' },
        { status: 404 }
      );
    }

    // Increment click count for link analytics
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

    const link = await prisma.link.findUnique({
      where: { code },
      include: { program: true, advisor: true },
    });

    if (!link || !link.active || !link.program.active || !link.advisor.active) {
      return NextResponse.json(
        { error: 'El enlace de inscripción no es válido o ha caducado.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = registrationSchema.parse(body);

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

    const registration = await prisma.registration.create({
      data: {
        linkId: link.id,
        advisorId: link.advisorId,
        programId: link.programId,

        fullName: validated.fullName.trim(),
        ci: validated.ci.trim(),
        ciExpedition: validated.ciExpedition,
        birthDate: new Date(validated.birthDate),
        age: validated.age,
        gender: validated.gender,
        civilStatus: validated.civilStatus,

        profession: validated.profession.trim(),
        university: validated.university.trim(),
        email: validated.email.toLowerCase().trim(),
        phone: validated.phone.trim(),
        whatsapp: validated.whatsapp.trim(),
        address: validated.address.trim(),
        city: validated.city.trim(),
        state: validated.state.trim(),
        country: validated.country.trim(),

        company: validated.company.trim(),
        position: validated.position.trim(),
        experienceYears: validated.experienceYears,

        modality: validated.modality as Modality,
        channel: validated.channel.trim(),
        notes: validated.notes?.trim() || null,
        termsAccepted: true,

        status: RegistrationStatus.NUEVO,
        ipAddress: clientIp,
      },
    });

    // Record initial status history entry
    await prisma.statusHistory.create({
      data: {
        registrationId: registration.id,
        previousStatus: RegistrationStatus.NUEVO,
        newStatus: RegistrationStatus.NUEVO,
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
      { error: 'Error al procesar la inscripción. Inténtalo nuevamente.' },
      { status: 500 }
    );
  }
}
