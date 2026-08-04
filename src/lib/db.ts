import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

function getVercelDatabaseUrl(): string {
  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );

  if (isVercel) {
    const tmpDbPath = path.join('/tmp', 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      try {
        const rootDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        const altDbPath = path.join(process.cwd(), 'dev.db');

        if (fs.existsSync(rootDbPath)) {
          fs.copyFileSync(rootDbPath, tmpDbPath);
        } else if (fs.existsSync(altDbPath)) {
          fs.copyFileSync(altDbPath, tmpDbPath);
        } else {
          fs.writeFileSync(tmpDbPath, '');
        }
      } catch (err) {
        console.error('Error preparing /tmp/dev.db on Vercel:', err);
      }
    }
    return `file:${tmpDbPath}`;
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  return 'file:./dev.db';
}

const dbUrl = getVercelDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

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

const SNAPSHOT_FILE = path.join('/tmp', 'db_snapshot.json');

export async function saveDatabaseSnapshot() {
  try {
    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();
    const programs = await prisma.program.findMany();
    const links = await prisma.link.findMany();
    const formSettings = await prisma.formSetting.findMany();

    const snapshot = {
      roles,
      users,
      programs,
      links,
      formSettings,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database snapshot:', err);
  }
}

export async function restoreDatabaseSnapshot() {
  if (!fs.existsSync(SNAPSHOT_FILE)) return;

  try {
    const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
    const snapshot = JSON.parse(raw);

    if (snapshot.roles && Array.isArray(snapshot.roles)) {
      for (const r of snapshot.roles) {
        await prisma.role.upsert({
          where: { id: r.id },
          update: { name: r.name },
          create: { id: r.id, name: r.name },
        });
      }
    }

    if (snapshot.users && Array.isArray(snapshot.users)) {
      for (const u of snapshot.users) {
        await prisma.user.upsert({
          where: { id: u.id },
          update: {
            name: u.name,
            email: u.email,
            password: u.password,
            phone: u.phone,
            active: u.active,
            roleId: u.roleId,
          },
          create: {
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            phone: u.phone,
            active: u.active,
            roleId: u.roleId,
          },
        });
      }
    }

    if (snapshot.programs && Array.isArray(snapshot.programs)) {
      for (const p of snapshot.programs) {
        await prisma.program.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            code: p.code,
            type: p.type,
            description: p.description,
            imageUrl: p.imageUrl,
            active: p.active,
          },
          create: {
            id: p.id,
            name: p.name,
            code: p.code,
            type: p.type,
            description: p.description,
            imageUrl: p.imageUrl,
            active: p.active,
          },
        });
      }
    }

    if (snapshot.links && Array.isArray(snapshot.links)) {
      for (const l of snapshot.links) {
        await prisma.link.upsert({
          where: { id: l.id },
          update: {
            code: l.code,
            advisorId: l.advisorId,
            programId: l.programId,
            active: l.active,
            clickCount: l.clickCount,
          },
          create: {
            id: l.id,
            code: l.code,
            advisorId: l.advisorId,
            programId: l.programId,
            active: l.active,
            clickCount: l.clickCount,
          },
        });
      }
    }
  } catch (e) {
    console.error('Error restoring snapshot:', e);
  }
}

export async function ensureDatabaseSeeded() {
  if (globalForPrisma.seededPromise) {
    return globalForPrisma.seededPromise;
  }

  globalForPrisma.seededPromise = (async () => {
    try {
      // 1. Ensure SQLite tables exist
      const createTablesSQL = [
        `CREATE TABLE IF NOT EXISTS "Role" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "phone" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT 1,
          "roleId" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS "Program" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "code" TEXT NOT NULL UNIQUE,
          "type" TEXT NOT NULL DEFAULT 'MAESTRIA',
          "description" TEXT,
          "imageUrl" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS "Link" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "code" TEXT NOT NULL UNIQUE,
          "advisorId" TEXT NOT NULL,
          "programId" TEXT NOT NULL,
          "active" BOOLEAN NOT NULL DEFAULT 1,
          "clickCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("advisorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS "Registration" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "linkId" TEXT,
          "advisorId" TEXT NOT NULL,
          "programId" TEXT NOT NULL,
          "fullName" TEXT NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "ci" TEXT NOT NULL,
          "ciExpedition" TEXT NOT NULL,
          "birthDate" DATETIME NOT NULL,
          "age" INTEGER NOT NULL,
          "gender" TEXT NOT NULL,
          "civilStatus" TEXT NOT NULL,
          "ciAnversoUrl" TEXT,
          "ciReversoUrl" TEXT,
          "academicDegree" TEXT,
          "profession" TEXT NOT NULL,
          "university" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "whatsapp" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "state" TEXT NOT NULL,
          "country" TEXT NOT NULL,
          "company" TEXT NOT NULL,
          "position" TEXT NOT NULL,
          "experienceYears" INTEGER NOT NULL,
          "modality" TEXT NOT NULL DEFAULT 'VIRTUAL',
          "channel" TEXT NOT NULL,
          "notes" TEXT,
          "termsAccepted" BOOLEAN NOT NULL DEFAULT 1,
          "status" TEXT NOT NULL DEFAULT 'NUEVO',
          "ipAddress" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("linkId") REFERENCES "Link" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          FOREIGN KEY ("advisorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS "StatusHistory" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "registrationId" TEXT NOT NULL,
          "previousStatus" TEXT NOT NULL,
          "newStatus" TEXT NOT NULL,
          "changedById" TEXT,
          "note" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS "AuditLog" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "action" TEXT NOT NULL,
          "entity" TEXT NOT NULL,
          "entityId" TEXT,
          "details" TEXT,
          "ipAddress" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS "FormSetting" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sectionKey" TEXT NOT NULL UNIQUE,
          "isMandatory" BOOLEAN NOT NULL DEFAULT 1,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
      ];

      for (const query of createTablesSQL) {
        try {
          await prisma.$executeRawUnsafe(query);
        } catch (e) {}
      }

      // Check if DB has users
      let userCount = 0;
      try {
        userCount = await prisma.user.count();
      } catch (err: any) {}

      if (userCount === 0) {
        console.log('Seeding initial Vercel production database...');
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

        // Create Users
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

          // Create links for Advisors
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
      }

      // Restore snapshot if available to persist custom programs and links across containers
      await restoreDatabaseSnapshot();
    } catch (e) {
      console.error('Error auto-seeding database:', e);
    }
  })();

  return globalForPrisma.seededPromise;
}
