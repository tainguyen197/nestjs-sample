import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default users
  const password = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicare.com' },
    update: {},
    create: {
      email: 'admin@medicare.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@medicare.com' },
    update: {},
    create: {
      email: 'superadmin@medicare.com',
      name: 'Super Admin',
      password,
      role: 'SUPER_ADMIN',
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@medicare.com' },
    update: {},
    create: {
      email: 'editor@medicare.com',
      name: 'Editor User',
      password,
      role: 'EDITOR',
    },
  });

  console.log('✅ Users seeded successfully:');
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Super Admin: ${superAdmin.email}`);
  console.log(`- Editor: ${editor.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
