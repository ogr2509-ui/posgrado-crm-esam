import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// =====================================================================
// SUPABASE POSTGRESQL CONNECTION CONFIGURATION
// =====================================================================
const SUPABASE_POOLER_URL =
  "postgresql://postgres.pjykahdqkmolglethdxs:Gonza250900.@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const SUPABASE_DIRECT_URL =
  "postgresql://postgres:Gonza250900.@db.pjykahdqkmolglethdxs.supabase.co:5432/postgres";

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

export async function saveDatabaseSnapshot() {}

const ADVISORS_SEED_DATA = [
  { name: 'Esther Quispe Isnado', email: 'maria.quispe@esam.edu.bo', phone: '+591 78223409' },
  { name: 'Jaime Gabriel Duarte', email: 'jaime.duarte@esam.edu.bo', phone: '+591 64337323' },
  { name: 'Nathaly Amanda Garcia Jigena', email: 'nathaly.garcia@esam.edu.bo', phone: '+591 69304045' },
  { name: 'Marisol Copa Huanca', email: 'marisol.copa@esam.edu.bo', phone: '+591 64589660' },
  { name: 'Nathaly Lisbeth Vargas Barca', email: 'nathaly.vargas@esam.edu.bo', phone: '+591 77172718' },
  { name: 'Estefany Tolaba Aguirre', email: 'estefany.tolaba@esam.edu.bo', phone: '+591 64589381' },
  { name: 'Jherisa Stalin Avendaño Cuenca', email: 'jherisa.avendano@esam.edu.bo', phone: '+591 64582440' },
  { name: 'Sarahi Aracely Iñiguez Tala', email: 'sarahi.iniguez@esam.edu.bo', phone: '+591 67968961' },
  { name: 'Fabiola Alvarado Centurio', email: 'fabiola.alvarado@esam.edu.bo', phone: '+591 64580810' },
  { name: 'Ana Belen Evia Ilaluque', email: 'ana.evia@esam.edu.bo', phone: '+591 64582688' },
  { name: 'Maribel Yucra Flores', email: 'maribel.yucra@esam.edu.bo', phone: '+591 64697764' },
  { name: 'Nayeli Oro Zelada', email: 'nayeli.oro@esam.edu.bo', phone: '+591 64581706' },
  { name: 'Juan Sebastian Mileta Pacheco', email: 'juan.miletap@esam.edu.bo', phone: '+591 74537939' },
];

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

      if (userCount <= 1) {
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
        await prisma.user.upsert({
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

        // Create 13 Sales Advisor Users
        const createdAdvisors = [];
        for (const adv of ADVISORS_SEED_DATA) {
          const user = await prisma.user.upsert({
            where: { email: adv.email.toLowerCase().trim() },
            update: { name: adv.name, phone: adv.phone, roleId: asesorRole.id, active: true },
            create: {
              name: adv.name,
              email: adv.email.toLowerCase().trim(),
              password: hashedPasswordAdvisor,
              phone: adv.phone,
              roleId: asesorRole.id,
              active: true,
            },
          });
          createdAdvisors.push(user);
        }

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

          for (const adv of createdAdvisors) {
            const baseCode = program.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            const suffix = crypto.createHash('md5').update(adv.id).digest('hex').substring(0, 4);
            const linkCode = `${baseCode}-${suffix}`;

            await prisma.link.upsert({
              where: { code: linkCode },
              update: {},
              create: {
                code: linkCode,
                advisorId: adv.id,
                programId: program.id,
                active: true,
              },
            });
          }
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

        console.log('Initial seeding with 13 Sales Advisors completed successfully.');
      }
    } catch (e) {
      console.error('Error auto-seeding database:', e);
    }
  })();

  return globalForPrisma.seededPromise;
}
