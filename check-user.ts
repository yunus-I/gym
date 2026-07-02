import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'superadmin@gym.com' }
  });
  console.log('User found:', user ? 'Yes' : 'No');
  if (user) {
    console.log('Role:', user.role);
    console.log('Password hash:', user.password.substring(0, 30) + '...');
    const valid = await bcrypt.compare('superadmin123', user.password);
    console.log('Password valid:', valid);
  }
  await prisma.$disconnect();
}

check();
