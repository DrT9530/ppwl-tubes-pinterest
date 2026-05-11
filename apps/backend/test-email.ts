import { PrismaClient } from '@prisma/client';
import { jwt } from '@elysiajs/jwt';

async function main() {
  const prisma = new PrismaClient();
  const j = jwt({ name: 'jwt', secret: 'your-super-secret-jwt-key-change-this-in-production' });
  const user = await prisma.user.findFirst({ where: { provider: 'EMAIL' } });
  
  if (!user) return console.log('no user');
  
  const token = await j.decorator.jwt.sign({ userId: user.id });
  console.log('TOKEN:', token);
  
  const res = await fetch('http://localhost:3000/auth/me', { 
    headers: { Authorization: 'Bearer ' + token } 
  });
  
  console.log(res.status, await res.text());
  prisma.$disconnect();
}
main();
