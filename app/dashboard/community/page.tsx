'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiMessageSquare, FiThumbsUp, FiEye, FiSearch, FiEdit, FiFilter } from 'react-icons/fi';

const forumThreads = [
  {
    id: 1,
    title: 'Bästa frukostreceptet för stabil energi hela dagen?',
    author: 'Anna A.',
    avatar: '/avatars/avatar-1.png',
    replies: 12,
    views: 88,
    lastReply: 'för 2 timmar sedan',
    category: 'Recept & Kost',
    categoryColor: 'bg-green-100 text-green-800'
  },
  {
    id: 2,
    title: 'Erfarenheter av Functional Flow-kursen?',
    author: 'Erik L.',
    avatar: '/avatars/avatar-2.png',
    replies: 7,
    views: 152,
    lastReply: 'igår',
    category: 'Kurser',
    categoryColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 3,
    title: 'Tips för att minska stress med meditation',
    author: 'Sofia B.',
    avatar: '/avatars/avatar-3.png',
    replies: 25,
    views: 230,
    lastReply: 'i förrgår',
    category: 'Livsstil & Hälsa',
    categoryColor: 'bg-purple-100 text-purple-800'
  },
   {
    id: 4,
    title: 'Vilka kosttillskott rekommenderas för vintern?',
    author: 'Jonas P.',
    avatar: '/avatars/avatar-4.png',
    replies: 18,
    views: 110,
    lastReply: '3 dagar sedan',
    category: 'Kosttillskott',
    categoryColor: 'bg-orange-100 text-orange-800'
  },
];

const ThreadItem = ({ thread }: { thread: typeof forumThreads[0] }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start gap-4">
        <Image src={thread.avatar} alt={thread.author} width={48} height={48} className="rounded-full hidden sm:block"/>
        <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${thread.categoryColor}`}>{thread.category}</span>
            </div>
            <Link href={`/dashboard/community/${thread.id}`}>
                <h3 className="text-lg font-bold text-gray-800 hover:text-primary transition-colors">{thread.title}</h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
                Startad av <span className="font-semibold text-gray-700">{thread.author}</span>
            </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-4 sm:gap-6 text-sm text-gray-600 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-none">
            <div className="flex items-center gap-2" title="Svar">
                <FiMessageSquare className="w-5 h-5 text-gray-400"/>
                <span className="font-medium">{thread.replies}</span>
            </div>
             <div className="flex items-center gap-2" title="Visningar">
                <FiEye className="w-5 h-5 text-gray-400"/>
                <span className="font-medium">{thread.views}</span>
            </div>
            <div className="text-right flex-grow sm:flex-grow-0">
                <p className="text-xs text-gray-500">Senaste svar</p>
                <p className="font-semibold">{thread.lastReply}</p>
            </div>
        </div>
    </div>
);


export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600 mt-1">Dela erfarenheter och lär av andra medlemmar.</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
            <FiEdit />
            <span>Starta ny diskussion</span>
        </button>
      </div>

       {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Sök i communityt..." className="input-style pl-12" />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="input-style appearance-none pl-12 pr-10">
            <option>Senaste</option>
            <option>Mest populära</option>
            <option>Mina inlägg</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {forumThreads.map(thread => (
            <ThreadItem key={thread.id} thread={thread} />
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