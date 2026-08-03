import { PrismaClient, RoleName, ProgramType, Modality, RegistrationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Enterprise Postgraduate CRM Database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN },
  });

  const asesorRole = await prisma.role.upsert({
    where: { name: RoleName.ASESOR },
    update: {},
    create: { name: RoleName.ASESOR },
  });

  console.log('✅ Roles created');

  // 2. Default Password Hash
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const asesorPasswordHash = await bcrypt.hash('Asesor123!', 10);

  // 3. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@posgrado.com' },
    update: {},
    create: {
      name: 'Administrador Principal',
      email: 'admin@posgrado.com',
      password: passwordHash,
      phone: '+591 70000000',
      roleId: adminRole.id,
      active: true,
    },
  });

  console.log('✅ Admin user created: admin@posgrado.com / Admin123!');

  // 4. Sales Advisors
  const juan = await prisma.user.upsert({
    where: { email: 'juan.perez@posgrado.com' },
    update: {},
    create: {
      name: 'Juan Pérez',
      email: 'juan.perez@posgrado.com',
      password: asesorPasswordHash,
      phone: '+591 71111111',
      roleId: asesorRole.id,
      active: true,
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: 'maria.lopez@posgrado.com' },
    update: {},
    create: {
      name: 'María López',
      email: 'maria.lopez@posgrado.com',
      password: asesorPasswordHash,
      phone: '+591 72222222',
      roleId: asesorRole.id,
      active: true,
    },
  });

  const carlos = await prisma.user.upsert({
    where: { email: 'carlos.gomez@posgrado.com' },
    update: {},
    create: {
      name: 'Carlos Gómez',
      email: 'carlos.gomez@posgrado.com',
      password: asesorPasswordHash,
      phone: '+591 73333333',
      roleId: asesorRole.id,
      active: true,
    },
  });

  console.log('✅ Sales advisors created (Juan, María, Carlos)');

  // 5. Academic Programs
  const programsData = [
    {
      name: 'Maestría en Educación Superior y Docencia Universitaria',
      code: 'MED-2026',
      type: ProgramType.MAESTRIA,
      description: 'Programa avanzado para profesionales en la gestión y enseñanza universitaria.',
    },
    {
      name: 'Maestría en Derecho Corporativo y Financiero',
      code: 'MDC-2026',
      type: ProgramType.MAESTRIA,
      description: 'Especialización estratégica en derecho de los negocios y regulación financiera.',
    },
    {
      name: 'Especialidad en Salud Pública y Epidemiología',
      code: 'ESP-2026',
      type: ProgramType.ESPECIALIDAD,
      description: 'Formación de alto nivel para gestión de sistemas sanitarios y políticas públicas.',
    },
    {
      name: 'Diplomado en Finanzas Corporativas y Fintech',
      code: 'DFC-2026',
      type: ProgramType.DIPLOMADO,
      description: 'Herramientas modernas para la toma de decisiones financieras e innovación digital.',
    },
    {
      name: 'Doctorado en Ciencias de la Ingeniería y Tecnología',
      code: 'DING-2026',
      type: ProgramType.DOCTORADO,
      description: 'Programa doctoral orientado a la investigación aplicada e innovación tecnológica.',
    },
  ];

  const createdPrograms = [];
  for (const prog of programsData) {
    const p = await prisma.program.upsert({
      where: { code: prog.code },
      update: {},
      create: prog,
    });
    createdPrograms.push(p);
  }

  console.log('✅ Programs created');

  // 6. Tracked Links for Advisors
  const link1 = await prisma.link.upsert({
    where: { code: '4fd89af8b2' },
    update: {},
    create: {
      code: '4fd89af8b2',
      advisorId: juan.id,
      programId: createdPrograms[0].id, // Maestría en Educación
      clickCount: 14,
      active: true,
    },
  });

  const link2 = await prisma.link.upsert({
    where: { code: '8ab12c34de' },
    update: {},
    create: {
      code: '8ab12c34de',
      advisorId: juan.id,
      programId: createdPrograms[1].id, // Maestría en Derecho
      clickCount: 9,
      active: true,
    },
  });

  const link3 = await prisma.link.upsert({
    where: { code: '99x77y66z1' },
    update: {},
    create: {
      code: '99x77y66z1',
      advisorId: maria.id,
      programId: createdPrograms[2].id, // Especialidad Salud
      clickCount: 22,
      active: true,
    },
  });

  const link4 = await prisma.link.upsert({
    where: { code: '33aa44bb55' },
    update: {},
    create: {
      code: '33aa44bb55',
      advisorId: carlos.id,
      programId: createdPrograms[3].id, // Diplomado Finanzas
      clickCount: 18,
      active: true,
    },
  });

  console.log('✅ Links created');

  // 7. Initial Student Registrations
  const mockStudents = [
    {
      linkId: link1.id,
      advisorId: juan.id,
      programId: createdPrograms[0].id,
      fullName: 'Roberto Vargas Morales',
      ci: '7654321',
      ciExpedition: 'LP',
      birthDate: new Date('1994-05-12'),
      age: 32,
      gender: 'Masculino',
      civilStatus: 'Soltero',
      profession: 'Licenciado en Pedagogía',
      university: 'Universidad Mayor de San Andrés',
      email: 'roberto.vargas@gmail.com',
      phone: '77889900',
      whatsapp: '77889900',
      address: 'Av. 6 de Agosto Nro 2450',
      city: 'La Paz',
      state: 'La Paz',
      country: 'Bolivia',
      company: 'Unidad Educativa San Antonio',
      position: 'Docente Titular',
      experienceYears: 6,
      modality: Modality.VIRTUAL,
      channel: 'WhatsApp',
      notes: 'Interesado en facilidades de pago en cuotas.',
      status: RegistrationStatus.CONTACTADO,
      ipAddress: '190.181.24.12',
    },
    {
      linkId: link1.id,
      advisorId: juan.id,
      programId: createdPrograms[0].id,
      fullName: 'Ana Isabel Mendoza',
      ci: '8877665',
      ciExpedition: 'CB',
      birthDate: new Date('1990-11-20'),
      age: 35,
      gender: 'Femenino',
      civilStatus: 'Casada',
      profession: 'Psicóloga Educativa',
      university: 'Universidad Católica Boliviana',
      email: 'ana.mendoza@hotmail.com',
      phone: '71234567',
      whatsapp: '71234567',
      address: 'Calle América 450',
      city: 'Cochabamba',
      state: 'Cochabamba',
      country: 'Bolivia',
      company: 'Consultora Pedagógica Alfa',
      position: 'Directora de Capacitación',
      experienceYears: 9,
      modality: Modality.SEMIPRESENCIAL,
      channel: 'Facebook / Meta Ads',
      notes: 'Solicitó información del plan de estudios detallado.',
      status: RegistrationStatus.NUEVO,
      ipAddress: '200.105.210.5',
    },
    {
      linkId: link3.id,
      advisorId: maria.id,
      programId: createdPrograms[2].id,
      fullName: 'Dr. Fernando Aguilera Rivas',
      ci: '4567890',
      ciExpedition: 'SC',
      birthDate: new Date('1988-02-15'),
      age: 38,
      gender: 'Masculino',
      civilStatus: 'Casado',
      profession: 'Médico Cirujano',
      university: 'Universidad Autónoma Gabriel René Moreno',
      email: 'f.aguilera@hospitalnorte.org',
      phone: '76543210',
      whatsapp: '76543210',
      address: 'Av. Banzer Km 4',
      city: 'Santa Cruz',
      state: 'Santa Cruz',
      country: 'Bolivia',
      company: 'Hospital General del Norte',
      position: 'Jefe de Emergencias',
      experienceYears: 12,
      modality: Modality.PRESENCIAL,
      channel: 'Recomendación de Colega',
      notes: 'Confirmó envío de título en provisión nacional.',
      status: RegistrationStatus.MATRICULADO,
      ipAddress: '181.115.34.88',
    },
    {
      linkId: link4.id,
      advisorId: carlos.id,
      programId: createdPrograms[3].id,
      fullName: 'Claudia Patricia Suárez',
      ci: '6543210',
      ciExpedition: 'OR',
      birthDate: new Date('1996-08-30'),
      age: 29,
      gender: 'Femenino',
      civilStatus: 'Soltera',
      profession: 'Ingeniera Financiera',
      university: 'Universidad Técnica de Oruro',
      email: 'claudia.suarez@bancoutils.com',
      phone: '70987654',
      whatsapp: '70987654',
      address: 'Calle Pagador 1230',
      city: 'Oruro',
      state: 'Oruro',
      country: 'Bolivia',
      company: 'Banco de Desarrollo',
      position: 'Analista de Riesgo de Crédito',
      experienceYears: 5,
      modality: Modality.VIRTUAL,
      channel: 'LinkedIn',
      notes: 'Documentación requerida enviada por correo.',
      status: RegistrationStatus.DOC_PENDIENTE,
      ipAddress: '190.129.50.4',
    },
  ];

  for (const s of mockStudents) {
    const reg = await prisma.registration.create({
      data: s,
    });

    // Create status history entry
    await prisma.statusHistory.create({
      data: {
        registrationId: reg.id,
        previousStatus: RegistrationStatus.NUEVO,
        newStatus: reg.status,
        changedById: reg.advisorId,
        note: `Estado inicial asignado: ${reg.status}`,
      },
    });
  }

  console.log('✅ Student registrations and status history created');

  // 8. Audit Log sample
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'Database',
      details: 'Base de datos inicializada exitosamente con usuarios, programas y datos demostrativos.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
