const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Creating missing recipes for rester meals...\n');
  
  const missingRecipes = [
    {
      name: "Blåbärs smoothiebowl rester",
      cleanName: "Blåbärs smoothiebowl",
      slug: "blabars-smoothiebowl"
    },
    {
      name: "Rökt lax med blomkålssallad och citronyoghurt rester", 
      cleanName: "Rökt lax med blomkålssallad och citronyoghurt",
      slug: "rokt-lax-med-blomkalsallad-och-citronyoghurt"
    },
    {
      name: "Högrevsburgare med hummusrester",
      cleanName: "Högrevsburgare med hummus", 
      slug: "hogrevsburgare-med-hummus"
    },
    {
      name: "Köttfärslimpa med ajvar, fetaost och rostad sötpotatisrester",
      cleanName: "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis",
      slug: "kottfarslimpa-med-ajvar-fetaost-och-rostad-sotpotatis"
    },
    {
      name: "Lammgryta plommon och bulgurrester",
      cleanName: "Lammgryta med plommon och bulgur",
      slug: "lammgryta-med-plommon-och-bulgur"
    },
    {
      name: "Köttfärsbiffar med tomatsalladrester", 
      cleanName: "Köttfärsbiffar med tomatsallad",
      slug: "kottfarsbiffar-med-tomatsallad"
    },
    {
      name: "Laxgratäng med scampi och broccolirester",
      cleanName: "Laxgratäng med scampi och broccoli", 
      slug: "laxgratang-med-scampi-och-broccoli"
    },
    {
      name: "Entrecote med haricot verts och bearnaisesås rester",
      cleanName: "Entrecote med haricot verts och bearnaisesås",
      slug: "entrecote-med-haricot-verts-och-bearnaisesas"
    },
    {
      name: "Spenatsoppa rostade pumpafrön rester",
      cleanName: "Spenatsoppa med rostade pumpafrön", 
      slug: "spenatsoppa-med-rostade-pumpafron"
    },
    {
      name: "Valnötslax med fetaostcrèmerester",
      cleanName: "Valnötslax med fetaostcrème",
      slug: "valnotslax-med-fetaostcreme"
    },
    {
      name: "Kyckling med blomkålsris och dillyoghurt rester",
      cleanName: "Kyckling med blomkålsris och dillyoghurt",
      slug: "kyckling-med-blomkalsris-och-dillyoghurt"
    },
    {
      name: "Stekt torsk med bearnaisesås och haricot vertsrester", 
      cleanName: "Stekt torsk med bearnaisesås och haricot verts",
      slug: "stekt-torsk-med-bearnaisesas-och-haricot-verts"
    }
  ];
  
  try {
    let created = 0;
    
    for (const recipe of missingRecipes) {
      // Check if recipe already exists
      const existing = await prisma.recipe.findUnique({
        where: { slug: recipe.slug }
      });
      
      if (existing) {
        console.log(`⏭️  Recipe already exists: ${recipe.cleanName}`);
        continue;
      }
      
             // Create the recipe
       await prisma.recipe.create({
         data: {
           title: recipe.cleanName,
           slug: recipe.slug,
           excerpt: `Läckert och näringsrikt recept för ${recipe.cleanName.toLowerCase()}.`,
           content: `Följ receptet för ${recipe.cleanName.toLowerCase()} för bästa resultat.`,
           instructions: `Instruktioner för ${recipe.cleanName.toLowerCase()}.`,
           ingredientsStructured: [],
           isPremium: true,
           isFree: false,
           tags: ['Basics', 'Flow'],
           imageUrl: '/images/recipe-placeholder.svg',
           categories: ['Huvudrätt'],
           ingredients: ['Enligt originalrecept']
         }
       });
      
      created++;
      console.log(`✅ Created recipe: ${recipe.cleanName} -> ${recipe.slug}`);
    }
    
    console.log(`\n🎉 Created ${created} missing recipes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 