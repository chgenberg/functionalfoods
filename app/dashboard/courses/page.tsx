'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiBookOpen, FiZap, FiCheckCircle, FiSearch, FiFilter, FiArrowRight } from 'react-icons/fi';

const allCourses = [
  {
    id: 1,
    title: 'Functional Flow',
    category: 'Avancerad Nutrition',
    progress: 65,
    image: '/functional_flow.png',
    description: 'En djupdykning i anti-inflammatorisk kost och hur du optimerar din hälsa på cellnivå.',
    totalModules: 8,
    completedModules: 5,
  },
  {
    id: 2,
    title: 'Functional Basics',
    category: 'Grundläggande Hälsa',
    progress: 100,
    image: '/functional_basics.png',
    description: 'Lär dig grunderna i funktionell kost och bygg en stabil grund för en hälsosammare livsstil.',
    totalModules: 6,
    completedModules: 6,
  },
];

const CourseCard = ({ course }: { course: typeof allCourses[0] }) => {
  const isCompleted = course.progress === 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="relative h-48 w-full">
        <Image src={course.image} alt={course.title} layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 right-4 bg-primary/80 text-white text-xs font-semibold px-3 py-1 rounded-full">{course.category}</div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{course.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Framsteg</span>
            <span className="font-semibold">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full bg-gradient-to-r ${isCompleted ? 'from-green-400 to-green-600' : 'from-primary to-accent'}`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        <Link 
          href={`/dashboard/courses/${course.id}`} 
          className="mt-auto w-full text-center bg-gray-100 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          {isCompleted ? <><FiCheckCircle /> Se resultat</> : <><FiZap /> Fortsätt kurs</>}
        </Link>
      </div>
    </div>
  );
};


export default function MyCoursesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mina kurser</h1>
          <p className="text-gray-600 mt-1">Din resa mot en bättre hälsa fortsätter här.</p>
        </div>
        <Link href="/utbildning" className="btn-primary inline-flex items-center gap-2">
            <FiBookOpen />
            <span>Hitta nya kurser</span>
        </Link>
      </div>
      
      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Sök bland dina kurser..." className="input-style pl-12" />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="input-style appearance-none pl-12 pr-10">
            <option>Alla</option>
            <option>Pågående</option>
            <option>Avslutade</option>
            <option>Ej påbörjade</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
       <style jsx global>{`
        .input-style {
          @apply w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors;
        }
         .btn-primary {
           @apply bg-primary hover:bg-accent text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md;
        }
      `}</style>
    </div>
  );
} 