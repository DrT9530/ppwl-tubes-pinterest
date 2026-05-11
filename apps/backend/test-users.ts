import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('ALL USERS:', users.length);
  const googleUsers = users.filter(u => u.provider === 'GOOGLE');
  console.log('GOOGLE USERS:', googleUsers.length);
}

main().finally(() => prisma.$disconnect());
