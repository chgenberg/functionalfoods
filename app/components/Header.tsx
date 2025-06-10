import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Min App</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              Om oss
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Kontakt
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 