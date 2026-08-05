const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADVISORS_DATA = [
  { name: 'Esther Quispe Isnado', email: 'maria.quispe@esam.edu.bo', phone: '+591 78223409', ci: '7171821Tj' },
  { name: 'Jaime Gabriel Duarte', email: 'jaime.duarte@esam.edu.bo', phone: '+591 64337323', ci: '7247784Tj' },
  { name: 'Nathaly Amanda Garcia Jigena', email: 'nathaly.garcia@esam.edu.bo', phone: '+591 69304045', ci: '7249817Tj' },
  { name: 'Marisol Copa Huanca', email: 'marisol.copa@esam.edu.bo', phone: '+591 64589660', ci: '9092467Lp' },
  { name: 'Nathaly Lisbeth Vargas Barca', email: 'nathaly.vargas@esam.edu.bo', phone: '+591 77172718', ci: '7168325Tj' },
  { name: 'Estefany Tolaba Aguirre', email: 'estefany.tolaba@esam.edu.bo', phone: '+591 64589381', ci: '12529809Tj' },
  { name: 'Jherisa Stalin Avendaño Cuenca', email: 'jherisa.avendano@esam.edu.bo', phone: '+591 64582440', ci: '7168940Tj' },
  { name: 'Sarahi Aracely Iñiguez Tala', email: 'sarahi.iniguez@esam.edu.bo', phone: '+591 67968961', ci: '10703396Tj' },
  { name: 'Fabiola Alvarado Centurio', email: 'fabiola.alvarado@esam.edu.bo', phone: '+591 64580810', ci: '10624848Ch' },
  { name: 'Ana Belen Evia Ilaluque', email: 'ana.evia@esam.edu.bo', phone: '+591 64582688', ci: '10678140Tj' },
  { name: 'Maribel Yucra Flores', email: 'maribel.yucra@esam.edu.bo', phone: '+591 64697764', ci: '10653278Ch' },
  { name: 'Nayeli Oro Zelada', email: 'nayeli.oro@esam.edu.bo', phone: '+591 64581706', ci: '12439910Tj' },
  { name: 'Juan Sebastian Mileta Pacheco', email: 'juan.miletap@esam.edu.bo', phone: '+591 74537939', ci: '7113090Tj' },
];

async function seedAdvisors() {
  console.log('Seeding 13 Sales Advisor profiles into Supabase PostgreSQL...');

  const hashedPasswordAdvisor = await bcrypt.hash('Asesor123!', 10);

  // Ensure ASESOR role exists
  const asesorRole = await prisma.role.upsert({
    where: { name: 'ASESOR' },
    update: {},
    create: { name: 'ASESOR' },
  });

  const createdAdvisors = [];

  for (const adv of ADVISORS_DATA) {
    const user = await prisma.user.upsert({
      where: { email: adv.email.toLowerCase().trim() },
      update: {
        name: adv.name.trim(),
        phone: adv.phone.trim(),
        password: hashedPasswordAdvisor,
        roleId: asesorRole.id,
        active: true,
      },
      create: {
        name: adv.name.trim(),
        email: adv.email.toLowerCase().trim(),
        phone: adv.phone.trim(),
        password: hashedPasswordAdvisor,
        roleId: asesorRole.id,
        active: true,
      },
    });

    createdAdvisors.push(user);
    console.log(`✓ Asesor creado/actualizado: ${user.name} (${user.email})`);
  }

  // Generate personal links for all active programs for each advisor
  const activePrograms = await prisma.program.findMany({ where: { active: true } });
  const crypto = require('crypto');

  for (const adv of createdAdvisors) {
    for (const prog of activePrograms) {
      const baseCode = prog.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const suffix = crypto.createHash('md5').update(adv.id).digest('hex').substring(0, 4);
      const linkCode = `${baseCode}-${suffix}`;

      await prisma.link.upsert({
        where: { code: linkCode },
        update: { active: true },
        create: {
          code: linkCode,
          programId: prog.id,
          advisorId: adv.id,
          active: true,
        },
      });
    }
  }

  console.log('¡TODOS LOS 13 ASESORES Y SUS ENLACES PERSONALIZADOS FUERON CREADOS EXITOSAMENTE!');
}

seedAdvisors()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
