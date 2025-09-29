const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapping av recept-namn till korrekta bilder
const imageMapping = {
  'Yoghurt med ketomüsli': 'Yoghurt med ketomüsli.jpg',
  'Tonfisksallad med äpple': 'Tonfisksallad med apple.jpg',
  'Squashspagetti med köttfärssås': 'Squashspagetti med köttfärssås.png',
  'Ketomüsli': 'Ketomüsli.jpg',
  'Stekt ägg med lax': 'Stekt agg med lax.jpg',
  'Het ratatouille': 'Laxfilé med ratatouille.jpg',
  'Laxfilé med ratatouille': 'Laxfilé med ratatouille.jpg',
  'Grön juice': 'Gron juice.jpg',
  'Pokébowl med kyckling': 'Pokebowl med kyckling.jpg',
  'Pokebowl med kyckling': 'Pokebowl med kyckling.jpg',
  'Köttfärsbiffar med stekt blomkål': 'Kottfarsbiffar med stekt blomkal.jpg',
  'Omelett med tomat': 'Omelett med tomat.jpg',
  'Havrefrallor med morötter och aprikoser': 'Havrefrallor med morotter och aprikoser.jpg',
  'Kycklinggryta med bakad spetskål': 'Kycklinggryta fran medelhavet.jpg',
  'Kycklinggryta från medelhavet': 'Kycklinggryta fran medelhavet.jpg',
  'Tropisk smoothiebowl': 'Tropisk Smoothiebowl.jpg',
  'Tropisk Smoothiebowl': 'Tropisk Smoothiebowl.jpg',
  'Laxburgare med krämig grönsaksröra': 'Hamburgare med grekisk sallad.jpg',
  'Hamburgare med grekisk sallad': 'Hamburgare med grekisk sallad.jpg',
  'Mangoglass': 'Mangoglass.jpg',
  'Ugnsbakad tomat med köttfärs': 'Kottfarsbiffar med stekt blomkal.jpg',
  'Torskrygg med ägghack och sparris': 'Torskrygg med agghack och sparris.jpg',
  'Turkiska lammfärsspett med raita och sallad': 'Turkiska lammfarsspett med raita och sallad.jpg',
  'Kycklingröra med örter och tomat': 'Kycklingrora med orter och tomat.jpg',
  'Lax med fetaost och rostade rotfrukter': 'Lax med fetaost och rostade rotfrukter.jpg',
  'Lax med fetaost och rostade rotfrukter och brysselkål': 'Lax med fetaost och rostade rotfrukter.jpg',
  'Asiatiska köttbullar med nudelsallad': 'Asiatiska kottbullar med nudelsallad.jpg',
  'Päronsallad med chévreost': 'Paronsallad med chevreost.jpg',
  'Nudelsoppa med grönsaker': 'Nudelsoppa med gronsaker.jpg',
  'Omelett med champinjoner': 'Omelett med champinjoner.jpg',
  'Morotsjuice': 'Morotsjuice.jpg',
  'Blåbärs smoothiebowl': 'Smoothiebowl.jpg',
  'Kycklingfylld aubergine': 'Kycklingfylld aubergine.jpg',
  'Äggröra med lax': 'Aggrora med lax.jpg',
  'Äggröra med rökt lax': 'Aggrora med lax.jpg',
  'Rökt lax med blomkålssallad och citronyoghurt': 'Rokt lax med blomkalsallad och citronyoghurt.jpg',
  'Rödbetsjuice': 'Rodbetsjuice.jpg',
  'Vegetarisk currygryta med panéer': 'Vegetarisk currygryta med paneer.jpg',
  'Keso med granola och fruktsallad': 'Keso med granola och fruktsallad.jpg',
  'Ugnsbakad kyckling med tzatziki och sallad': 'Ugnsbakad kyckling med tzatziki och sallad.jpg',
  'Omelett med hallon': 'Omelett med hallon.jpg',
  'Lax med waldorfsallad': 'Lax med waldorfsallad.jpg',
  'Omelett med bär': 'Omelett med bar.jpg',
  'Grekiska köttbullar i tomatsås': 'Grekiska kottbullar i tomatsas.jpg',
  'Grekiska köttbullar i tomatsås med rostad sötpotatis': 'Grekiska kottbullar i tomatsas.jpg',
  'Ägghack med kalkon': 'Agghack med kalkon.jpg',
  'Fruktsmoothie': 'Smoothie.jpg',
  'Laxsallad med vindruvor': 'Laxsallad med vindruvor.jpg',
  'Bananplättar med mango och granatäpple': 'Bananplattar med mango och granatapple.jpg',
  'Grillade köttspett med grekisk sallad och morotstzatziki': 'Grillspett med grekisk sallad och morotstzatziki.jpg',
  'Grillspett med grekisk sallad och morotstzatziki': 'Grillspett med grekisk sallad och morotstzatziki.jpg',
  'Keso med hallon och granatäpple': 'Keso med hallon och granatapple.jpg',
  'Havregrynsgröt med torkad frukt och äpple': 'Havregrynsgrot med torkad frukt.jpg',
  'Torsk från mellanöstern': 'Torsk fran mellanostern.jpg',
  'Japansk kycklingfärswok med groddar': 'Asiatisk kycklingfars med gronkal.jpg',
  'Äggröra med paprika': 'Aggrora med paprika.jpg',
  'Grekisk sallad med fetaost': 'Laxsallad med fetaost.jpg',
  'Chiafrögröt': 'Tropisk chiafrogrot.jpg',
  'Köttfärslimpa med ajvar och rostad sötpotatis': 'Kottfarslimpa med ajvar och rostad sotpotatis.jpg',
  'Bananplättar med jordgubbar och kokos': 'Bananplattar med jordgubbar och kokos.jpg',
  'Skaldjursgryta med torsk i gul curry': 'Skaldjursgryta med torsk i gul curry.jpg',
  'Mangosmoothie med spenat': 'Smoothie med spenat.jpg',
  'Kycklingjärpar med linssallad': 'Kycklingjarpar med linssallad.jpg',
  'Mandelkaka med frukt': 'Mandelkaka med frukt.jpg',
  'Grönsakswok med kyckling': 'Pokebowl med kyckling.jpg',
  'Kokt ägg med majonnäs': 'Kokt agg med majonnas.jpg',
  'Köttfärspytt med italienska smaker': 'Kottfarspytt med italienska smaker.jpg',
  'Mango med keso och nötter': 'Mango med keso och notter.jpg',
  'Indisk laxgryta med röda linser': 'Indisk laxgryta med roda linser.jpg',
  'Äggröra med granatäpple och kiwi': 'Aggrora med granatapple och kiwi.jpg',
  'Quinoasallad med stekt halloumi': 'Quinoasallad med halloumi.jpg',
  'Havregrynsgröt med apelsin och kokos': 'Havregrynsgrot med apelsin och kokos.jpg',
  'Torsk teriyaki med grönsaker': 'Torsk teriyaki med gronsaker.jpg',
  'Hallon- och blåbärssmoothie': 'Hallon- och blabarssmoothie.jpg',
  'Lammgryta med plommon och bulgur': 'Lammgryta med plommon och bulgur.jpg',
  'Lammgryta plommon och bulgur': 'Lammgryta med plommon och bulgur.jpg',
  'Tropisk fruktsallad': 'Tropisk fruktsallad.jpg'
};

async function updateRecipeImages() {
  try {
    console.log('Starting recipe image update...');
    
    let updated = 0;
    let notFound = 0;
    
    for (const [recipeName, imagePath] of Object.entries(imageMapping)) {
      // Try to find recipe by name
      const recipe = await prisma.recipe.findFirst({
        where: { 
          title: recipeName 
        }
      });
      
      if (!recipe) {
        console.log(`❌ Recipe not found: ${recipeName}`);
        notFound++;
        continue;
      }
      
      // Check if image file exists
      const fullPath = path.join(process.cwd(), 'public', 'recept_images_2025', imagePath);
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Image file not found: ${imagePath}`);
        continue;
      }
      
      // Update recipe with correct image URL
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          imageUrl: `/recept_images_2025/${imagePath}`
        }
      });
      
      console.log(`✅ Updated: ${recipeName} -> ${imagePath}`);
      updated++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updated} recipes`);
    console.log(`❌ Not found: ${notFound} recipes`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRecipeImages();
