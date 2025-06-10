import { ReactNode } from 'react';
import { classNames } from '../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
        className
      )}
    >
      {children}
    </div>
  );
} 