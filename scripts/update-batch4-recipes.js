const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const recipes = [
      {
        search: { title: { contains: 'Morotsjuice', mode: 'insensitive' } },
        data: {
          title: 'Morotsjuice',
          prepTime: '10 minuter',
          servings: 2,
          excerpt: 'En frisk och färgstark juice laddad med betakaroten, C‑vitamin och antiinflammatoriska egenskaper!',
          tags: ['Morötter', 'Apelsin'],
          nutrition: { perServing: { energy: 314, carbohydrates: 63, fat: 1, protein: 4, fiber: 16 } },
          ingredients: ['1 kg morötter', '1 st äpple', '1 st apelsin', '2 msk färsk ingefära'],
          instructions: `1. Skär morötter och äpple i bitar.
2. Skär bort skalet på apelsinen och dela.
3. Lägg ner morötter, äpple, apelsin och ingefära i en råsaftcentrifug och häll upp saften på glas eller flaska.
4. Juicen håller sig i tre dagar i kyl.`
        }
      },
      {
        search: { title: { contains: 'Mandarin med kanelkräm', mode: 'insensitive' } },
        data: {
          title: 'Mandarin med kanelkräm',
          prepTime: '5 minuter',
          servings: 1,
          excerpt: 'En snabb och fräsch dessert där saftiga mandariner toppas med en krämig kanelgrädde och knapriga mandelspån. Perfekt som en söt men nyttig avslutning på måltiden.',
          tags: ['Mandarin', 'Kanel'],
          nutrition: { perServing: { energy: 133, carbohydrates: 10, fat: 8, protein: 2, fiber: 2 } },
          ingredients: ['1.5 st mandarin', '1 msk kokosgrädde', '0.5 tsk agavesirap', '0.5 krm kanel', '1 msk rostade mandelspån (dekoration)'],
          instructions: `1. Skala och skär mandarin på mitten.
2. Lägg upp på ett fat.
3. Blanda kokosgrädde och agavesirap i en skål.
4. Tillsätt kanel.
5. Rör runt.
6. Lägg kanelkrämen på mandarinerna.
7. Dekorera med rostade mandelspån.`
        }
      },
      {
        search: { title: { contains: 'Inkokta päron', mode: 'insensitive' } },
        data: {
          title: 'Inkokta päron med chokladcréme och mandlar',
          prepTime: '15 minuter',
          servings: 2,
          excerpt: 'En lyxig och enkel dessert där sötman från inkokta päron möter krämig chokladcréme och knapriga mandlar. Perfekt för en snabb efterrätt med både fibrer, antioxidanter och hälsosamma fetter.',
          tags: ['Päron', 'Mörk choklad'],
          nutrition: { perServing: { energy: 299, carbohydrates: 26, fat: 18, protein: 6, fiber: 0 } },
          ingredients: ['2 st päron', '40 g mörk choklad', '1 msk grädde', '1 msk vatten', '3 msk mandelspån'],
          instructions: `1. Skala päron och koka i vatten i cirka 10 minuter.
2. Häll av vattnet och ställ päronen på tallrikar.
3. Smält choklad i ett vattenbad och blanda ner grädde och vatten.
4. Häll chokladen över päronen och toppa med mandelspån.`
        }
      },
      {
        search: { title: { contains: 'Snickersmuffins', mode: 'insensitive' } },
        data: {
          title: 'Snickersmuffins',
          prepTime: '25 minuter',
          servings: 6,
          excerpt: 'Dessa snickersinspirerade muffins kombinerar krämigt jordnötssmör med choklad och nötter för en ljuvlig smakupplevelse. Glutenfria och fyllda med näring – perfekta för fikat!',
          tags: ['Mandelmjöl', 'Kakao', 'Jordnötssmör'],
          nutrition: { perServing: { energy: 369, carbohydrates: 5, fat: 34, protein: 23, fiber: 1 } },
          ingredients: ['100 g smör', '2.5 dl mandelmjöl', '0.5 dl sötströ', '1 tsk bakpulver', '2 tsk kakao', '2 st ägg', '6 st muffinsformar', '2 msk jordnötssmör (topping)', '2 msk chokladknappar (topping)', '3 msk saltade jordnötter (topping)'],
          instructions: `1. Sätt ugnen på 175 grader.
2. Smält smöret i en kastrull.
3. Blanda i alla ingredienser till smeten.
4. Lägg muffinsformar i en muffinsplåt.
5. Lägg en klick jordnötssmör i varje muffins och häll på smeten.
6. Toppa med chokladknappar och nötter.
7. Grädda i 15 minuter.
8. Går bra att frysa in.`
        }
      },
      {
        search: { title: { contains: 'Stekta äpplen med vit chokladkräm', mode: 'insensitive' } },
        data: {
          title: 'Stekta äpplen med vit chokladkräm',
          prepTime: '10 minuter',
          servings: 2,
          excerpt: 'En läcker efterrätt med naturlig sötma och fiber från frukt.',
          tags: ['äpplen', 'Kanel'],
          nutrition: { perServing: { energy: 337, carbohydrates: 37, fat: 18, protein: 3, fiber: 5 } },
          ingredients: ['3 st äpplen', '1 tsk smör', '1 tsk flytande honung', '1 krm kardemumma', '1 krm kanel', '30 g vit choklad', '50 g philadelphiaost'],
          instructions: `1. Skiva äpplen tunt.
2. Hetta upp en stekpanna med smör och stek äpplen i någon minut.
3. Häll på honung och strö på kanel och kardemumma.
4. Lägg upp i skålar.
5. Smält vit choklad i en skål i mikron.
6. Blanda ner philadelphiaost.
7. Klicka på chokladkräm på äpplena och servera.`
        }
      },
      {
        search: { title: { contains: 'Chokladriskaka', mode: 'insensitive' } },
        data: {
          title: 'Chokladriskaka med jordnötssmör',
          prepTime: '60 minuter',
          servings: 4,
          excerpt: 'En snabb och god treat med kombinationen av krämigt jordnötssmör, mörk choklad och knapriga riskakor.',
          tags: ['Jordnötssmör', 'Mörk choklad'],
          nutrition: { perServing: { energy: 204, carbohydrates: 13, fat: 14, protein: 45, fiber: 0 } },
          ingredients: ['4 msk jordnötssmör', '4 st riskakor', '50 g mörk choklad', '1 krm flingsalt'],
          instructions: `1. Bred jordnötssmör på riskakorna.
2. Skär chokladen i rutor och lägg i en skål.
3. Smält i micron någon minut.
4. Bred över chokladen på riskakorna och strö på lite flingsalt.
5. Ställ in i frysen i 1 timme.`
        }
      },
      {
        search: { title: { contains: 'Burrata med tomatsallad', mode: 'insensitive' } },
        data: {
          title: 'Burrata med tomatsallad',
          prepTime: '10 minuter',
          servings: 1,
          excerpt: 'En enkel men näringstät sallad med mycket antioxidanter och hälsosamma fetter – perfekt som lätt lunch eller förrätt!',
          tags: ['Tomat', 'Olivolja', 'Pinjenötter'],
          nutrition: { perServing: { energy: 706, carbohydrates: 22, fat: 59, protein: 22, fiber: 2 } },
          ingredients: ['1 st tomat', '125 g burrata', 'salt och svartpeppar', '1 tsk torkad basilika', '5 st cocktailtomater', '1 tsk olivolja', '1 tsk balsamvinäger', '1 msk färsk basilika', '0.5 msk grön pesto', '1 msk pinjenötter', '0.5 msk färsk basilika (topping)'],
          instructions: `1. Skiva tomaten och lägg på en tallrik.
2. Placera burratan i mitten och strö på salt, peppar och torkade örter.
3. Hacka basilika.
4. Halvera cocktailtomaterna och lägg i en skål tillsammans med olivolja, balsamico och basilika.
5. Häll blandningen över burrataosten.
6. Rosta pinjenötterna i en stekpanna.
7. Klicka på pesto och strö över rostade pinjenötter.
8. Garnera med basilika.`
        }
      },
      {
        search: { title: { contains: 'Rotfruktssoppa', mode: 'insensitive' } },
        data: {
          title: 'Rotfruktssoppa',
          prepTime: '25 minuter',
          servings: 2,
          excerpt: 'En värmande och kryddig soppa baserad på rotfrukter.',
          tags: ['Palsternacka', 'Kålrot', 'Vitlök'],
          nutrition: { perServing: { energy: 143, carbohydrates: 20, fat: 3, protein: 1, fiber: 3 } },
          ingredients: ['1 st palsternacka', '0.25 st kålrot', '1 st morot', '0.5 st gul lök', '1 klyfta vitlök', '1 tsk olivolja', '1 tsk spiskummin', '0.5 tsk cayennepeppar', '1 tsk torkad basilika', '1 st lagerblad', '0.5 msk tomatpuré', '5 dl vatten', '1 st grönsaksbuljongtärning', 'salt och svartpeppar', '1 msk färsk persilja (topping)'],
          instructions: `1. Skala och skär alla grönsaker i mindre bitar.
2. Skala och finhacka lök och vitlök.
3. Hetta upp en gryta och stek grönsakerna och löken i lite olja.
4. Tillsätt kryddor, tomatpuré och häll på vatten.
5. Smula ner buljongtärningen och låt koka i 20 minuter.
6. Smaka av med salt och peppar.
7. Fördela en portion i en soppskål.
8. Toppa med hackad persilja.`
        }
      }
    ];

    for (const recipe of recipes) {
      const found = await prisma.recipe.findFirst({ where: recipe.search });
      
      if (found) {
        await prisma.recipe.update({
          where: { id: found.id },
          data: recipe.data
        });
        console.log(`✅ Updated: ${recipe.data.title}`);
        console.log(`   ${recipe.data.nutrition.perServing.energy} kcal, ${recipe.data.nutrition.perServing.protein}g protein`);
      } else {
        console.log(`❌ Not found: ${recipe.data.title}`);
      }
    }

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
