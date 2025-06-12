'use client';

import { FiDownload, FiFileText, FiImage, FiVideo, FiSearch, FiFilter } from 'react-icons/fi';

const downloadableFiles = [
  {
    id: 1,
    title: 'Startguide - Funktionell Kost',
    description: 'En komplett guide för att komma igång med din nya livsstil.',
    type: 'pdf',
    size: '2.5 MB',
    icon: <FiFileText className="text-red-500 w-8 h-8" />,
    href: '#'
  },
  {
    id: 2,
    title: 'Veckans Receptsamling',
    description: '7 nya, hälsosamma och enkla recept för hela veckan.',
    type: 'pdf',
    size: '4.1 MB',
    icon: <FiFileText className="text-red-500 w-8 h-8" />,
    href: '#'
  },
  {
    id: 3,
    title: 'Inköpslista - Anti-inflammatorisk',
    description: 'En utskriftsvänlig inköpslista för att förenkla dina matinköp.',
    type: 'pdf',
    size: '0.8 MB',
    icon: <FiFileText className="text-red-500 w-8 h-8" />,
    href: '#'
  },
  {
    id: 4,
    title: 'Exklusiva Skrivbordsunderlägg',
    description: 'Motiverande och snygga bakgrundsbilder till din dator.',
    type: 'image',
    size: '12.3 MB',
    icon: <FiImage className="text-blue-500 w-8 h-8" />,
    href: '#'
  },
    {
    id: 5,
    title: 'Guidad Meditation (Video)',
    description: 'En 10-minuters guidad meditation för att minska stress.',
    type: 'video',
    size: '45.2 MB',
    icon: <FiVideo className="text-purple-500 w-8 h-8" />,
    href: '#'
  },
];

const FileItem = ({ file }: { file: typeof downloadableFiles[0] }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-6">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
            {file.icon}
        </div>
        <div className="flex-grow">
             <h3 className="text-lg font-bold text-gray-800">{file.title}</h3>
             <p className="text-sm text-gray-600 mt-1">{file.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
             <a href={file.href} download className="btn-secondary inline-flex items-center gap-2">
                <FiDownload/>
                <span>Ladda ner ({file.size})</span>
             </a>
        </div>
    </div>
);


export default function DownloadsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold text-gray-900">Nerladdningar</h1>
        <p className="text-gray-600 mt-1">Här hittar du allt ditt exklusiva material samlat på ett ställe.</p>
      </div>

       {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Sök bland filer..." className="input-style pl-12" />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="input-style appearance-none pl-12 pr-10">
            <option>Alla filtyper</option>
            <option>PDF</option>
            <option>Bild</option>
            <option>Video</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {downloadableFiles.map(file => (
            <FileItem key={file.id} file={file} />
        ))}
      </div>
       <style jsx global>{`
        .input-style {
          @apply w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors;
        }
        .btn-secondary {
           @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-3 rounded-lg transition-colors;
        }
      `}</style>
    </div>
  );
} 