"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Din varukorg är tom</h2>
        <p className="text-gray-600 mb-6">Lägg till produkter för att komma igång</p>
        <Link href="/utbildning" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">Utforska kurser</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">Din varukorg</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.type === 'course' ? 'Kurs' : 'Bok'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="w-24 text-right">
              <p className="font-medium">{item.price * item.quantity} kr</p>
            </div>
            <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium">Totalt</span>
          <span className="text-2xl font-semibold">{total} kr</span>
        </div>
        <Link href="/checkout" className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors">Gå till kassan</Link>
      </div>
    </div>
  );
} 