export const metadata = {
  title: 'Alla kurser | Functional Foods',
  description: 'Utforska våra kurser inom Functional Foods: Functional Basics och Functional Flow.'
};

import { redirect } from 'next/navigation';

export default function AllaKurser() {
  redirect('/utbildning');
  return null;
} 