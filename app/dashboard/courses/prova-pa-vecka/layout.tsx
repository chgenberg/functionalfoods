'use client';

import { ReactNode, useEffect, useState } from 'react';
import HelpGuide from '@/app/components/HelpGuide';

export default function ProvaPaVeckaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  useEffect(() => {
    const handler = () => setShowHelpGuide(true);
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  return (
    <>
      {children}
      <HelpGuide isOpen={showHelpGuide} onClose={() => setShowHelpGuide(false)} />
    </>
  );
}
