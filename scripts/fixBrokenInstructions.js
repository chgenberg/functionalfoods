const { PrismaClient } = require('@prisma/client');

const fixes = [
  {
    slug: 'yoghurt-med-ketomusli',
    instructions: 'Lägg yoghurt i en skål och lägg på ketomüsli.'
  },
  {
    slug: 'tonfisksallad-med-apple',
    instructions: 'Skala och strimla rödlök. Skär röd och grön paprika i mindre bitar. Kärna ur och skiva äpple. Låt tonfisk rinna av i ett durkslag. Skala och skär ägg i mindre bitar.\n\nPlacera ut salladsbladen på ett fat. Lägg upp ägg, tonfisk, rödlök, paprika och äpple. Garnera med skivade oliver, en persiljekvist samt citronklyfa.'
  }
];

(async () => {
  const prisma = new PrismaClient();
  try {
    for (const f of fixes) {
      await prisma.recipe.update({
        where: { slug: f.slug },
        data: { instructions: f.instructions }
      });
      console.log('✅ Fixed instructions:', f.slug);
    }
    console.log('\n🎉 Instructions fixed!');
  } catch (e) {
    console.error('❌ Fix failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 