'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunityRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Facebook community group
    window.location.href = 'https://www.facebook.com/groups/1168295381877412/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Omdirigerar till vår Facebook-community...
        </h1>
        <p className="text-gray-600">
          Om du inte omdirigeras automatiskt, 
          <a 
            href="https://www.facebook.com/groups/1168295381877412/" 
            className="text-primary hover:underline ml-1"
          >
            klicka här
          </a>
        </p>
      </div>
    </div>
  );
}