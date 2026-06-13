import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'manager@gym.com' }
  });
  console.log('User found:', user ? 'Yes' : 'No');
  if (user) {
    console.log('Has password:', !!user.password);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
