import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// =====================================================================
// SUPABASE POSTGRESQL CONNECTION CONFIGURATION
// =====================================================================
// DATABASE_URL: Transaction pooler on port 6543 (required for Vercel serverless)
// DIRECT_URL:   Direct connection on port 5432 (used only for local migrations)
//
// Vercel and all serverless runtimes MUST use the pooler URL (port 6543).
// Direct connections (port 5432) are blocked by Vercel's internal network.
// =====================================================================
const SUPABASE_POOLER_URL =
  "postgresql://postgres.pjykahdqkmolglethdxs:Gonza250900.@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const SUPABASE_DIRECT_URL =
  "postgresql://postgres:Gonza250900.@db.pjykahdqkmolglethdxs.supabase.co:5432/postgres";

// Force the correct pooler URL at runtime. This guarantees both
// local dev and Vercel always connect correctly regardless of .env state.
const dbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://postgres.pjykahdqkmolglethdxs')
    ? process.env.DATABASE_URL
    : SUPABASE_POOLER_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  seededPromise: Promise<void> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// No-op: Supabase PostgreSQL persists data natively — no snapshot needed.
export async function saveDatabaseSnapshot() {}

export async function ensureDatabaseSeeded() {
  if (globalForPrisma.seededPromise) {
    return globalForPrisma.seededPromise;
  }

  globalForPrisma.seededPromise = (async () => {
    try {
      let userCount = 0;
      try {
        userCount = await prisma.user.count();
      } catch (err: any) {
        console.error('DB connection check failed:', err.message);
        return;
      }

      if (userCount === 0) {
        console.log('Seeding initial Supabase PostgreSQL database...');
        const hashedPasswordAdmin = await bcrypt.hash('Admin123!', 10);
        const hashedPasswordAdvisor = await bcrypt.hash('Asesor123!', 10);

        // Create Roles
        const adminRole = await prisma.role.upsert({
          where: { name: 'ADMIN' },
          update: {},
          create: { name: 'ADMIN' },
        });

        const asesorRole = await prisma.role.upsert({
          where: { name: 'ASESOR' },
          update: {},
          create: { name: 'ASESOR' },
        });

        // Create Admin User
        const adminUser = await prisma.user.upsert({
          where: { email: 'admin@posgrado.com' },
          update: { password: hashedPasswordAdmin, roleId: adminRole.id, active: true },
          create: {
            name: 'Administrador Principal',
            email: 'admin@posgrado.com',
            password: hashedPasswordAdmin,
            phone: '+591 71234567',
            roleId: adminRole.id,
            active: true,
          },
        });

        // Create Advisor Users
        const juanAdvisor = await prisma.user.upsert({
          where: { email: 'juan.perez@posgrado.com' },
          update: { password: hashedPasswordAdvisor, roleId: asesorRole.id, active: true },
          create: {
            name: 'Juan Pérez',
            email: 'juan.perez@posgrado.com',
            password: hashedPasswordAdvisor,
            phone: '+591 79876543',
            roleId: asesorRole.id,
            active: true,
          },
        });

        const mariaAdvisor = await prisma.user.upsert({
          where: { email: 'maria.lopez@posgrado.com' },
          update: { password: hashedPasswordAdvisor, roleId: asesorRole.id, active: true },
          create: {
            name: 'María López',
            email: 'maria.lopez@posgrado.com',
            password: hashedPasswordAdvisor,
            phone: '+591 78901234',
            roleId: asesorRole.id,
            active: true,
          },
        });

        const carlosAdvisor = await prisma.user.upsert({
          where: { email: 'carlos.ruiz@posgrado.com' },
          update: { password: hashedPasswordAdvisor, roleId: asesorRole.id, active: true },
          create: {
            name: 'Carlos Ruiz',
            email: 'carlos.ruiz@posgrado.com',
            password: hashedPasswordAdvisor,
            phone: '+591 77654321',
            roleId: asesorRole.id,
            active: true,
          },
        });

        // Create Initial Programs
        const programsData = [
          {
            name: 'Maestría en Marketing Digital e Inteligencia Artificial',
            code: 'MMD-IA-2026',
            type: 'MAESTRIA',
            description: 'Especialización avanzada en estrategias de marketing impulsadas por IA y análisis predictivo de datos.',
          },
          {
            name: 'Maestría en Educación Superior y Gestión del Conocimiento',
            code: 'MES-GC-2026',
            type: 'MAESTRIA',
            description: 'Formación de alto nivel para docentes universitarios e investigadores en educación contemporánea.',
          },
          {
            name: 'Diplomado en Gerencia de Proyectos bajo Enfoque PMBOK',
            code: 'DGP-PMI-2026',
            type: 'DIPLOMADO',
            description: 'Programa ejecutivo enfocado en la certificación PMP y metodologías ágiles de gestión de proyectos.',
          },
        ];

        for (const prog of programsData) {
          const program = await prisma.program.upsert({
            where: { code: prog.code },
            update: {},
            create: prog,
          });

          const linkCodeJuan = `${program.code.toLowerCase()}-juan`;
          await prisma.link.upsert({
            where: { code: linkCodeJuan },
            update: {},
            create: {
              code: linkCodeJuan,
              advisorId: juanAdvisor.id,
              programId: program.id,
              active: true,
            },
          });

          const linkCodeMaria = `${program.code.toLowerCase()}-maria`;
          await prisma.link.upsert({
            where: { code: linkCodeMaria },
            update: {},
            create: {
              code: linkCodeMaria,
              advisorId: mariaAdvisor.id,
              programId: program.id,
              active: true,
            },
          });
        }

        // Initialize default FormSettings
        const sectionKeys = ['datos_personales', 'documentos_ci', 'datos_contacto', 'datos_academicos'];
        for (const key of sectionKeys) {
          await prisma.formSetting.upsert({
            where: { sectionKey: key },
            update: {},
            create: { sectionKey: key, isMandatory: true },
          });
        }

        console.log('Initial seeding completed successfully.');
      }
    } catch (e) {
      console.error('Error auto-seeding database:', e);
    }
  })();

  return globalForPrisma.seededPromise;
}
