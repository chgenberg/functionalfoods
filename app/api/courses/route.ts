import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  features: string[];
  modules: {
    title: string;
    lessons: {
      title: string;
      type: 'video' | 'text' | 'quiz' | 'download';
      duration?: string;
      content?: string;
    }[];
  }[];
  requirements: string[];
  learningGoals: string[];
  status: 'published' | 'draft';
  isPremium: boolean;
  enrollmentCount: number;
  rating: number;
  imageUrl: string;
  instructor: {
    name: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Dummy data för kurser
const dummyCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Functional Basics',
    description: 'Lär dig grunderna inom functional foods och hur du kan förbättra din hälsa genom rätt kostval.',
    category: 'Grundkurs',
    level: 'Nybörjare',
    price: 1299,
    duration: '6 veckor',
    features: [
      'Omfattande videolektioner',
      'Personlig handledning',
      'Kostschema och recept',
      'Community-forum',
      'Certifikat vid slutförande'
    ],
    modules: [
      {
        title: 'Introduktion till Functional Foods',
        lessons: [
          { title: 'Vad är functional foods?', type: 'video', duration: '15 min' },
          { title: 'Vetenskapen bakom functional foods', type: 'text' },
          { title: 'Kunskapstest', type: 'quiz' }
        ]
      },
      {
        title: 'Praktisk tillämpning',
        lessons: [
          { title: 'Att välja rätt functional foods', type: 'video', duration: '20 min' },
          { title: 'Receptsamling', type: 'download' }
        ]
      }
    ],
    requirements: [
      'Grundläggande intresse för hälsa och kost',
      'Dator eller mobil med internetanslutning'
    ],
    learningGoals: [
      'Förstå vad functional foods är',
      'Kunna identifiera functional foods i butiken',
      'Skapa en personlig kostplan',
      'Förbättra din hälsa genom kosttillägg'
    ],
    status: 'published',
    isPremium: false,
    enrollmentCount: 1247,
    rating: 4.8,
    imageUrl: '/functional_basics.png',
    instructor: {
      name: 'Ulrika Davidsson',
      title: 'Nutritionist & Functional Food Expert'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'course-2',
    title: 'Functional Flow',
    description: 'Fördjupa dig inom functional foods och lär dig avancerade tekniker för optimal hälsa.',
    category: 'Fortsättningskurs',
    level: 'Avancerad',
    price: 1999,
    duration: '8 veckor',
    features: [
      'Avancerade videolektioner',
      'Personlig coaching',
      'Exklusiva recept',
      'Laboratorieanalyser',
      'Premium community'
    ],
    modules: [
      {
        title: 'Avancerade functional foods',
        lessons: [
          { title: 'Superfoods och deras effekter', type: 'video', duration: '25 min' },
          { title: 'Vetenskapliga studier', type: 'text' },
          { title: 'Fördjupningstest', type: 'quiz' }
        ]
      },
      {
        title: 'Personlig optimering',
        lessons: [
          { title: 'Individuell kostplanering', type: 'video', duration: '30 min' },
          { title: 'Avancerade recept', type: 'download' }
        ]
      }
    ],
    requirements: [
      'Genomgången Functional Basics-kurs',
      'Grundläggande kunskap inom nutrition'
    ],
    learningGoals: [
      'Behärska avancerade functional foods-tekniker',
      'Skapa personliga kosttillägg',
      'Optimera din hälsa på djupare nivå',
      'Förstå vetenskapliga studier'
    ],
    status: 'published',
    isPremium: true,
    enrollmentCount: 543,
    rating: 4.9,
    imageUrl: '/functional_flow.png',
    instructor: {
      name: 'Ulrika Davidsson',
      title: 'Nutritionist & Functional Food Expert'
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T14:20:00Z'
  },
  {
    id: 'course-3',
    title: 'Longevity & Anti-Aging',
    description: 'Lär dig hur functional foods kan bidra till ett längre och hälsosammare liv.',
    category: 'Specialkurs',
    level: 'Medel',
    price: 1599,
    duration: '4 veckor',
    features: [
      'Fokus på anti-aging',
      'Longevity-strategier',
      'Vetenskaplig grund',
      'Praktiska tips',
      'Expertstöd'
    ],
    modules: [
      {
        title: 'Longevity-grunder',
        lessons: [
          { title: 'Åldrande och nutrition', type: 'video', duration: '20 min' },
          { title: 'Anti-aging functional foods', type: 'text' },
          { title: 'Kunskapstest', type: 'quiz' }
        ]
      }
    ],
    requirements: [
      'Intresse för longevity och anti-aging',
      'Grundläggande hälsokunskap'
    ],
    learningGoals: [
      'Förstå sambandet mellan kost och åldrande',
      'Använda functional foods för anti-aging',
      'Skapa en longevity-kostplan'
    ],
    status: 'draft',
    isPremium: false,
    enrollmentCount: 0,
    rating: 0,
    imageUrl: '/longevity.png',
    instructor: {
      name: 'Ulrika Davidsson',
      title: 'Nutritionist & Functional Food Expert'
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-10T09:15:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let courses = [...dummyCourses];

    // Filtrera baserat på sökparametrar
    if (category && category !== 'all') {
      courses = courses.filter(course => course.category === category);
    }

    if (status && status !== 'all') {
      courses = courses.filter(course => {
        if (status === 'published') return course.status === 'published' && !course.isPremium;
        if (status === 'draft') return course.status === 'draft';
        if (status === 'premium') return course.isPremium;
        return true;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
      );
    }

    // Sortera efter uppdateringsdatum
    courses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Paginering
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = courses.slice(startIndex, endIndex);

    // Extrahera unika kategorier
    const allCategories = [...new Set(dummyCourses.map(course => course.category))];

    // Beräkna statistik
    const statistics = {
      total: courses.length,
      published: courses.filter(c => c.status === 'published' && !c.isPremium).length,
      premium: courses.filter(c => c.isPremium).length,
      draft: courses.filter(c => c.status === 'draft').length,
      totalEnrollments: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
      averageRating: courses.reduce((sum, c) => sum + c.rating, 0) / courses.length || 0
    };

    return NextResponse.json({
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total: courses.length,
        totalPages: Math.ceil(courses.length / limit),
        hasMore: endIndex < courses.length
      },
      categories: allCategories.sort(),
      statistics
    });

  } catch (error) {
    console.error('Error in courses API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
} 