import { PrismaClient, Role } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const gym = await prisma.gym.upsert({
    where: { id: 'default-gym' },
    update: {},
    create: {
      id: 'default-gym',
      name: 'Elite Fitness Center',
      location: 'Addis Ababa, Ethiopia',
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'manager@gym.com' },
    update: {},
    create: {
      email: 'manager@gym.com',
      password: hashedPassword,
      name: 'Gym Manager',
      role: Role.MANAGER,
      gymId: gym.id,
    },
  });

  // Default Plans
  const plans = [
    { name: 'Monthly', duration: 30, price: 1000 },
    { name: 'Quarterly', duration: 90, price: 2700 },
    { name: 'Yearly', duration: 365, price: 10000 },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { name: plan.name, gymId: gym.id }
    });
    if (!existing) {
      await prisma.plan.create({
        data: {
          ...plan,
          gymId: gym.id,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
