import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

async function check(label: string, dbPath: string) {
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });

  const manager = await prisma.user.findUnique({ where: { email: 'manager@gym.com' } });
  const superAdmin = await prisma.user.findUnique({ where: { email: 'superadmin@gym.com' } });

  console.log(`[${label}]`);
  console.log('  manager@gym.com:', manager ? 'OK' : 'MISSING');
  if (superAdmin) {
    const valid = await bcrypt.compare('superadmin123', superAdmin.password);
    console.log('  superadmin@gym.com: OK (password valid:', valid, ')');
  } else {
    console.log('  superadmin@gym.com: MISSING');
  }
  console.log('  db:', dbPath);
  console.log();
  await prisma.$disconnect();
}

async function main() {
  await check('CURRENT', path.join(process.cwd(), 'dev.db'));

  const { execSync } = require('child_process');
  const tmpDir = require('os').tmpdir();
  const tmpDb = path.join(tmpDir, 'dev-committed.db');
  execSync(`git show HEAD:dev.db > "${tmpDb}"`);
  await check('COMMITTED (HEAD)', tmpDb);
}

main();
