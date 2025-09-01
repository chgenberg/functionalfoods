"use client";
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiLoader } from 'react-icons/fi';
import { useState } from 'react';

interface AddToCartProps {
  id: string;
  name: string;
  price: number;
  type: 'course' | 'book';
  image?: string;
}

export default function AddToCart({ id, name, price, type, image }: AddToCartProps) {
  const { addItem, isLoaded } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!isLoaded) return;
    
    try {
      addItem({ id, name, price, type, image, quantity: 1 });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  if (!isLoaded) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        <FiLoader className="w-5 h-5 animate-spin" />
        Laddar...
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
        isAdded
          ? 'bg-[#FF7e70] text-white shadow-lg'
          : 'bg-[#FF7e70] text-white hover:bg-[#e56b5e] shadow-md hover:shadow-lg'
      }`}
    >
      <FiShoppingCart className={`w-5 h-5 transition-transform duration-300 ${isAdded ? 'rotate-12' : ''}`} />
      {isAdded ? 'Tillagd i varukorg' : 'Lägg i varukorg'}
    </button>
  );
} 