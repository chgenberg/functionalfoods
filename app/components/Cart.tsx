"use client";
import { useCart } from "../context/CartContext";
import { X, Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import Link from "next/link";

export default function Cart() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Din varukorg är tom
        </h3>
        <p className="text-gray-600 mb-4">
          Lägg till program eller produkter för att komma igång
        </p>
        <Link
          href="/utbildning"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          Utforska program
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Varukorg ({items.length})</h2>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Rensa alla
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.price} kr</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium">Totalt</span>
          <span className="text-2xl font-semibold">{total} kr</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-[#FF7e70] text-white text-center py-3 rounded-lg hover:bg-[#e56b5e] transition-colors"
        >
          Gå till kassan
        </Link>
      </div>
    </div>
  );
}
