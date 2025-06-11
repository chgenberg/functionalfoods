"use client";
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface AddToCartProps {
  id: string;
  name: string;
  price: number;
  type: 'course' | 'book';
  image?: string;
}

export default function AddToCart({ id, name, price, type, image }: AddToCartProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({ id, name, price, type, image, quantity: 1 });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
        isAdded
          ? 'bg-green-500 text-white shadow-lg'
          : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
      }`}
    >
      <ShoppingCart className={`w-5 h-5 transition-transform duration-300 ${isAdded ? 'rotate-12' : ''}`} />
      {isAdded ? 'Tillagd i varukorg' : 'Lägg i varukorg'}
    </button>
  );
} 