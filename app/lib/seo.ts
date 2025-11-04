import { Metadata } from 'next';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  locale?: string;
  alternateLocales?: string[];
}

const DEFAULT_CONFIG = {
  siteName: 'Ulrika Functional Foods',
  siteUrl: 'https://functionalfoods.se',
  defaultImage: '/images/og-default.jpg',
  defaultDescription: 'Upptäck kraften i functional foods med Ulrika Davidsson. Personliga hälsoplaner, evidensbaserade kurser och recept för optimal hälsa.',
  author: 'Ulrika Davidsson',
  locale: 'sv_SE',
  alternateLocales: ['en_US', 'es_ES', 'de_DE', 'fr_FR']
};

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description = DEFAULT_CONFIG.defaultDescription,
    keywords = [],
    image = DEFAULT_CONFIG.defaultImage,
    url,
    type = 'website',
    author = DEFAULT_CONFIG.author,
    publishedTime,
    modifiedTime,
    section,
    locale = DEFAULT_CONFIG.locale,
    alternateLocales = DEFAULT_CONFIG.alternateLocales
  } = config;

  const fullTitle = title 
    ? `${title} | ${DEFAULT_CONFIG.siteName}`
    : DEFAULT_CONFIG.siteName;

  const fullUrl = url 
    ? `${DEFAULT_CONFIG.siteUrl}${url}`
    : DEFAULT_CONFIG.siteUrl;

  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${DEFAULT_CONFIG.siteUrl}${image}`;

  const metadata: Metadata = {
    metadataBase: new URL(DEFAULT_CONFIG.siteUrl),
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: [{ name: author }],
    creator: author,
    publisher: DEFAULT_CONFIG.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      siteName: DEFAULT_CONFIG.siteName,
      title: fullTitle,
      description,
      url: fullUrl,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || DEFAULT_CONFIG.siteName,
        },
      ],
      locale,
      alternateLocale: alternateLocales,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      creator: '@functionalfoods_se',
      site: '@functionalfoods_se',
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'sv-SE': fullUrl,
        'en-US': fullUrl.replace('functionalfoods.se', 'functionalfoods.se/en'),
        'es-ES': fullUrl.replace('functionalfoods.se', 'functionalfoods.se/es'),
        'de-DE': fullUrl.replace('functionalfoods.se', 'functionalfoods.se/de'),
        'fr-FR': fullUrl.replace('functionalfoods.se', 'functionalfoods.se/fr'),
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };

  return metadata;
}

export function generateStructuredData(config: SEOConfig & {
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  courseInfo?: {
    name: string;
    description: string;
    provider: string;
    price?: number;
    currency?: string;
    duration?: string;
    difficulty?: string;
    rating?: number;
    reviewCount?: number;
  };
  recipeInfo?: {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    servings?: number;
    calories?: number;
    nutrition?: Record<string, string>;
  };
}) {
  const structuredData: any[] = [];

  // Organization schema
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: DEFAULT_CONFIG.siteName,
    url: DEFAULT_CONFIG.siteUrl,
    logo: `${DEFAULT_CONFIG.siteUrl}/FF_logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+46-XXX-XXX-XXX',
      contactType: 'customer service',
      availableLanguage: ['Swedish', 'English', 'Spanish', 'German', 'French']
    },
    sameAs: [
      'https://www.instagram.com/functionalfoods.se/',
      'https://www.tiktok.com/@functionalfoods.se',
      'https://facebook.com/functionalfoods.se'
    ]
  });

  // Website schema
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_CONFIG.siteName,
    url: DEFAULT_CONFIG.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DEFAULT_CONFIG.siteUrl}/kunskapsbank/sok?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  });

  // Breadcrumbs
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: config.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${DEFAULT_CONFIG.siteUrl}${crumb.url}`
      }))
    });
  }

  // FAQ schema
  if (config.faqItems && config.faqItems.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  // Course schema
  if (config.courseInfo) {
    const course = config.courseInfo;
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.name,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: course.provider || DEFAULT_CONFIG.siteName
      },
      ...(course.price && {
        offers: {
          '@type': 'Offer',
          price: course.price,
          priceCurrency: course.currency || 'SEK'
        }
      }),
      ...(course.duration && { timeRequired: course.duration }),
      ...(course.difficulty && { educationalLevel: course.difficulty }),
      ...(course.rating && course.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewCount,
          bestRating: 5,
          worstRating: 1
        }
      })
    });
  }

  // Recipe schema
  if (config.recipeInfo) {
    const recipe = config.recipeInfo;
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      image: config.image ? `${DEFAULT_CONFIG.siteUrl}${config.image}` : undefined,
      author: {
        '@type': 'Person',
        name: DEFAULT_CONFIG.author
      },
      recipeIngredient: recipe.ingredients,
      recipeInstructions: recipe.instructions.map((instruction, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: instruction
      })),
      ...(recipe.prepTime && { prepTime: recipe.prepTime }),
      ...(recipe.cookTime && { cookTime: recipe.cookTime }),
      ...(recipe.totalTime && { totalTime: recipe.totalTime }),
      ...(recipe.servings && { recipeYield: recipe.servings }),
      ...(recipe.calories && {
        nutrition: {
          '@type': 'NutritionInformation',
          calories: recipe.calories,
          ...recipe.nutrition
        }
export function generateStructuredData(config: SEOConfig & {
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  courseInfo?: {
    name: string;
    description: string;
    provider: string;
    price?: number;
    currency?: string;
    duration?: string;
    difficulty?: string;
    rating?: number;
    reviewCount?: number;
  };
  recipeInfo?: {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    servings?: number;
    calories?: number;
    nutrition?: Record<string, string>;
    image?: string;
    author?: string;
  };
  articleInfo?: {
    headline: string;
    description: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    image?: string;
    section?: string;
  };
  personInfo?: {
    name: string;
    jobTitle?: string;
    description?: string;
    image?: string;
    url?: string;
  };
}) {
  const structuredData: any[] = [];

  // Organization schema (always included)
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: DEFAULT_CONFIG.siteName,
    url: DEFAULT_CONFIG.siteUrl,
    logo: `${DEFAULT_CONFIG.siteUrl}/FF_logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Swedish', 'English', 'Spanish', 'German', 'French']
    },
    sameAs: [
      'https://www.instagram.com/functionalfoods.se/',
      'https://www.tiktok.com/@functionalfoods.se',
      'https://facebook.com/functionalfoods.se'
    ],
    // LLM-friendly: explicit about what the organization does
    description: 'Expert-led functional foods education and personalized health programs by Ulrika Davidsson',
    founder: {
      '@type': 'Person',
      name: DEFAULT_CONFIG.author
    }
  });

  // Website schema (always included)
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_CONFIG.siteName,
    url: DEFAULT_CONFIG.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DEFAULT_CONFIG.siteUrl}/kunskapsbank/sok?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    // LLM-friendly: explicit about site purpose
    description: DEFAULT_CONFIG.defaultDescription,
    inLanguage: ['sv-SE', 'en-US', 'es-ES', 'de-DE', 'fr-FR']
  });

  // Breadcrumbs
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: config.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${DEFAULT_CONFIG.siteUrl}${crumb.url}`
      }))
    });
  }

  // FAQ schema
  if (config.faqItems && config.faqItems.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  // Course schema
  if (config.courseInfo) {
    const course = config.courseInfo;
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.name,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: course.provider || DEFAULT_CONFIG.siteName,
        url: DEFAULT_CONFIG.siteUrl
      },
      ...(course.price && {
        offers: {
          '@type': 'Offer',
          price: course.price,
          priceCurrency: course.currency || 'SEK',
          availability: 'https://schema.org/InStock',
          url: `${DEFAULT_CONFIG.siteUrl}/utbildning`
        }
      }),
      ...(course.duration && { timeRequired: course.duration }),
      ...(course.difficulty && { educationalLevel: course.difficulty }),
      ...(course.rating && course.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: course.rating,
          reviewCount: course.reviewCount,
          bestRating: 5,
          worstRating: 1
        }
      }),
      // LLM-friendly: explicit about course content
      courseCode: course.name.replace(/\s+/g, '-').toLowerCase(),
      teaches: 'Functional foods, nutrition, health optimization'
    });
  }

  // Recipe schema (enhanced for LLM)
  if (config.recipeInfo) {
    const recipe = config.recipeInfo;
    const recipeData: any = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      author: {
        '@type': 'Person',
        name: recipe.author || DEFAULT_CONFIG.author
      },
      recipeIngredient: recipe.ingredients,
      recipeInstructions: recipe.instructions.map((instruction, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: instruction
      })),
      ...(recipe.prepTime && { prepTime: recipe.prepTime }),
      ...(recipe.cookTime && { cookTime: recipe.cookTime }),
      ...(recipe.totalTime && { totalTime: recipe.totalTime }),
      ...(recipe.servings && { recipeYield: `${recipe.servings} ${recipe.servings === 1 ? 'portion' : 'portioner'}` }),
      // LLM-friendly additions
      cuisine: 'Functional Foods',
      suitableForDiet: ['https://schema.org/LowFatDiet', 'https://schema.org/GlutenFreeDiet'],
      ...(recipe.image && { image: `${DEFAULT_CONFIG.siteUrl}${recipe.image}` })
    };

    if (recipe.calories || recipe.nutrition) {
      recipeData.nutrition = {
        '@type': 'NutritionInformation',
        ...(recipe.calories && { calories: `${recipe.calories} kcal` }),
        ...recipe.nutrition
      };
    }

    structuredData.push(recipeData);
  }

  // Article schema (enhanced for LLM)
  if (config.articleInfo) {
    const article = config.articleInfo;
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      author: {
        '@type': 'Person',
        name: article.author || DEFAULT_CONFIG.author
      },
      publisher: {
        '@type': 'Organization',
        name: DEFAULT_CONFIG.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${DEFAULT_CONFIG.siteUrl}/FF_logo.svg`
        }
      },
      ...(article.publishedTime && { datePublished: article.publishedTime }),
      ...(article.modifiedTime && { dateModified: article.modifiedTime }),
      ...(article.image && { image: `${DEFAULT_CONFIG.siteUrl}${article.image}` }),
      ...(article.section && { articleSection: article.section }),
      // LLM-friendly: explicit about article topic
      about: {
        '@type': 'Thing',
        name: 'Functional Foods',
        description: 'Evidence-based nutrition and health optimization'
      },
      keywords: 'functional foods, nutrition, health, wellness, Ulrika Davidsson'
    });
  }

  // Person schema (for author pages)
  if (config.personInfo) {
    const person = config.personInfo;
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      ...(person.jobTitle && { jobTitle: person.jobTitle }),
      ...(person.description && { description: person.description }),
      ...(person.image && { image: `${DEFAULT_CONFIG.siteUrl}${person.image}` }),
      ...(person.url && { url: person.url }),
      // LLM-friendly: explicit about expertise
      knowsAbout: ['Functional Foods', 'Nutrition', 'Health Optimization', 'Evidence-Based Nutrition'],
      alumniOf: 'Nutrition and Health Sciences',
      worksFor: {
        '@type': 'Organization',
        name: DEFAULT_CONFIG.siteName
      }
    });
  }

  return structuredData;
}

export function injectStructuredData(structuredData: any[]) {
  if (typeof document === 'undefined') return;

  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  // Add new structured data
  structuredData.forEach(data => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  });
} 