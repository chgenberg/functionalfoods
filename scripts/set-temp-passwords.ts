import { prisma } from '../app/lib/database';
import bcrypt from 'bcryptjs';

async function run() {
  const targets = [
    { where: { email: { contains: 'qte.se', mode: 'insensitive' } }, label: 'qte.se' },
    { where: { OR: [
      { email: { contains: 'paula', mode: 'insensitive' } },
      { name:  { contains: 'paula', mode: 'insensitive' } }
    ]}, label: 'paula' }
  ];

  const results: Array<{ email: string; password: string }> = [];

  for (const t of targets) {
    const user = await prisma.user.findFirst({ where: t.where as any });
    if (!user) {
      console.log(`❌ Hittade ingen användare för filtret: ${t.label}`);
      continue;
    }
    const temp = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    const hash = await bcrypt.hash(temp, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash, mustChangePassword: true } });
    results.push({ email: user.email, password: temp });
    console.log(`✅ Satt temp-lösenord för ${user.email}`);
  }

  console.log('\n==== Testinloggningar ====');
  results.forEach((r, i) => {
    console.log(`${i+1}. Email: ${r.email}  |  Temporärt lösenord: ${r.password}`);
  });
  console.log('\nLogin: https://www.functionalfoods.se/login');
}

run().then(() => prisma.$disconnect());
