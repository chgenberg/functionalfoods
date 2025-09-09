import { ReactNode } from 'react';

export default function AdminLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {children}
    </div>
  );
} 