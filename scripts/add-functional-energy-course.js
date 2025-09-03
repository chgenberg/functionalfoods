const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Adding Functional Energy course to database...\n');

  try {
    // Check if course already exists
    const existingCourse = await prisma.courseProduct.findUnique({
      where: { name: 'Functional Energy' }
    });

    if (existingCourse) {
      console.log('❌ Functional Energy course already exists in database');
      return;
    }

    // Create the course
    const course = await prisma.courseProduct.create({
      data: {
        name: 'Functional Energy',
        description: 'En kurs för dig som är i riskzonen för typ 2-diabetes, har prediabetes eller vill bromsa en utveckling som redan är på gång. Få stabilt blodsocker och jämn energi hela dagen.',
        price: 2295,
        content: {
          weeks: 6,
          recipes: 85,
          materials: [
            'Veckovisa videolektioner',
            'Kompletta måltidsplaner',
            'Inköpslistor',
            'Råvaruguide',
            'One-to-one coachning',
            'Tillgång till community'
          ],
          weeklyTopics: [
            'Introduktion till stabil energi',
            'Blodsocker & energi', 
            'Måltidsplanering för energi',
            'Smarta kolhydrater',
            'Energistabila vanor',
            'Långsiktig hållbarhet'
          ]
        },
        features: [
          {
            title: 'Stabilt blodsocker',
            description: 'Slipp energidippar och blodsockerkrascher'
          },
          {
            title: 'Mindre sötsug',
            description: 'Minska behovet av snacks och kaffe'
          },
          {
            title: 'Bättre fokus',
            description: 'Förbättra mental klarhet och koncentration'
          },
          {
            title: 'Förbättrad sömn',
            description: 'Balanserat blodsocker ger bättre återhämtning'
          },
          {
            title: '85 energistabila recept',
            description: 'Recept med fokus på låg blodsockerpåverkan'
          },
          {
            title: 'Personlig coaching',
            description: 'One-to-one coaching med Ulrika'
          }
        ]
      }
    });

    console.log('✅ Successfully created Functional Energy course');
    console.log('📦 Course ID:', course.id);
    console.log('💰 Price:', course.price, 'SEK');
    console.log('📚 Content:', JSON.stringify(course.content, null, 2));

  } catch (error) {
    console.error('❌ Error creating course:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 