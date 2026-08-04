import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded, saveDatabaseSnapshot } from '@/lib/db';
import { registrationSchema } from '@/lib/validations/registration';
import { RegistrationStatus, Modality } from '@prisma/client';
import { CRMIntegrationService } from '@/lib/crm-service';

async function getLinkByCode(code: string) {
  await ensureDatabaseSeeded();

  const rawCode = (code || '').trim();
  const lowerCode = rawCode.toLowerCase();
  const upperCode = rawCode.toUpperCase();

  let link: any = await prisma.link.findFirst({
    where: {
      OR: [
        { code: { equals: rawCode } },
        { code: { equals: lowerCode } },
        { code: { equals: upperCode } },
      ],
    },
    include: {
      program: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          description: true,
          imageUrl: true,
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
          { code: { equals: rawCode } },
          { code: { equals: lowerCode } },
          { code: { equals: upperCode } },
          { name: { contains: rawCode } },
        ],
      },
      include: {
        links: {
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

    if (program) {
      if (program.links && program.links.length > 0) {
        const firstLink = program.links[0];
        link = {
          ...firstLink,
          program: {
            id: program.id,
            name: program.name,
            code: program.code,
            type: program.type,
            description: program.description,
            imageUrl: program.imageUrl,
            active: true,
          },
        };
      } else {
        let defaultAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
        if (defaultAdvisor) {
          const createdLink = await prisma.link.create({
            data: {
              code: `${program.code.toLowerCase()}-oficial`,
              programId: program.id,
              advisorId: defaultAdvisor.id,
              active: true,
            },
            include: {
              program: { select: { id: true, name: true, code: true, type: true, description: true, imageUrl: true, active: true } },
              advisor: { select: { id: true, name: true, phone: true, email: true, active: true } },
            },
          });
          link = createdLink;
        }
      }
    }
  }

  if (link) {
    if (!link.advisor) {
      const activeAdvisor = await prisma.user.findFirst({ where: { active: true } }) || await prisma.user.findFirst();
      if (activeAdvisor) {
        link.advisor = {
          id: activeAdvisor.id,
          name: activeAdvisor.name,
          phone: activeAdvisor.phone,
          email: activeAdvisor.email,
          active: true,
        };
      }
    }

    if (link.program) link.program.active = true;
    if (link.advisor) link.advisor.active = true;
    link.active = true;
  }

  return link;
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const link = await getLinkByCode(code);

    if (!link || !link.program || !link.advisor) {
      return NextResponse.json(
        { error: 'El enlace de inscripción no está disponible o ha sido desactivado.' },
        { status: 404 }
      );
    }

    try {
      await prisma.link.update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
      });
    } catch (e) {
      // Click count update error ignored
    }

    return NextResponse.json({
      valid: true,
      program: link.program,
      advisor: {
        name: link.advisor.name,
        phone: link.advisor.phone,
        email: link.advisor.email,
      },
    });
  } catch (error) {
    console.error('Error fetching public form data:', error);
    return NextResponse.json({ error: 'Error al cargar formulario público.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const link = await getLinkByCode(code);

    if (!link || !link.program || !link.advisor) {
      return NextResponse.json(
        { error: 'El enlace de inscripción no está disponible para procesar el registro.' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Field normalization
    const fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    const cleanEmail = (body.email || '').toLowerCase().trim();
    const cleanPhone = (body.phone || body.whatsapp || '').trim();

    const validated = registrationSchema.parse({
      ...body,
      fullName: fullName || body.fullName,
      email: cleanEmail,
      phone: cleanPhone,
      whatsapp: cleanPhone,
    });

    const birthDateObj = new Date(validated.birthDate);

    // Prevent duplicated registrations for same program & CI
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        programId: link.programId,
        ci: validated.ci,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Ya existe un registro completado con esta Cédula de Identidad para este programa.' },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        linkId: link.id,
        advisorId: link.advisorId,
        programId: link.programId,
        fullName: validated.fullName,
        firstName: validated.firstName,
        lastName: validated.lastName,
        ci: validated.ci,
        ciExpedition: validated.ciExpedition,
        birthDate: birthDateObj,
        age: Number(validated.age),
        gender: validated.gender,
        civilStatus: validated.civilStatus,
        ciAnversoUrl: validated.ciAnversoUrl || null,
        ciReversoUrl: validated.ciReversoUrl || null,
        academicDegree: validated.academicDegree || null,
        profession: validated.profession,
        university: validated.university,
        email: validated.email,
        phone: validated.phone,
        whatsapp: validated.whatsapp,
        address: validated.address,
        city: validated.city,
        state: validated.state || 'N/A',
        country: validated.country || 'Bolivia',
        company: validated.company,
        position: validated.position,
        experienceYears: Number(validated.experienceYears),
        modality: (validated.modality as Modality) || 'VIRTUAL',
        channel: validated.channel || 'Formulario Web',
        notes: validated.notes || null,
        termsAccepted: true,
        status: 'NUEVO',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    try {
      await prisma.statusHistory.create({
        data: {
          registrationId: registration.id,
          previousStatus: 'INICIAL',
          newStatus: 'NUEVO',
          note: 'Postulación registrada desde enlace público web',
        },
      });
    } catch (e) {
      console.error('StatusHistory error ignored:', e);
    }

    // Trigger external integrations asynchronously
    CRMIntegrationService.dispatchIntegrations(registration, link.advisor, link.program).catch((err) => {
      console.error('CRM Integration warning:', err);
    });

    await saveDatabaseSnapshot();

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
    console.error('Error submitting public registration:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la inscripción.' },
      { status: 500 }
    );
  }
}
