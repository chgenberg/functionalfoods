"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { applyMothersDayBundlePricing } from '@/app/lib/campaigns/mothers-day';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'course' | 'book';
  image?: string;
}

interface AppliedCoupon {
  code: string;
  type: string; // Can be 'percent', 'PERCENTAGE', 'fixed', 'FIXED', etc.
  amount: number;
  appliesTo: 'all' | string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isLoaded: boolean;
  discount: number;
  finalTotal: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Load cart and coupon from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart);
          }
        }
        const savedCoupon = localStorage.getItem('cart_coupon');
        if (savedCoupon) {
          const parsedCoupon = JSON.parse(savedCoupon);
          if (parsedCoupon && parsedCoupon.code) {
            setAppliedCoupon(parsedCoupon);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
        localStorage.removeItem('cart_coupon');
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Persist cart and coupon; recompute totals
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
        if (appliedCoupon) localStorage.setItem('cart_coupon', JSON.stringify(appliedCoupon));
        else localStorage.removeItem('cart_coupon');
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }

    const pricedItems = applyMothersDayBundlePricing(items);
    const newTotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);

    // Compute discount locally from appliedCoupon
    let newDiscount = 0;
    if (appliedCoupon && items.length > 0) {
      const applicableItems = appliedCoupon.appliesTo === 'all'
        ? pricedItems
        : pricedItems.filter(i => (appliedCoupon.appliesTo as string[]).includes(i.id));
      const applicableSubtotal = applicableItems.reduce((s, i) => s + i.price * i.quantity, 0);
      if (applicableSubtotal > 0) {
        // Normalize type for comparison (handle PERCENTAGE, percent, PERCENT, etc.)
        const normalizedType = String(appliedCoupon.type || '').toUpperCase();
        const isPercentage = normalizedType === 'PERCENTAGE' || normalizedType === 'PERCENT';
        
        if (isPercentage) {
          newDiscount = Math.round(applicableSubtotal * (appliedCoupon.amount / 100));
        } else {
          newDiscount = Math.round(appliedCoupon.amount);
        }
        if (newDiscount > applicableSubtotal) newDiscount = applicableSubtotal;
      }
    }

    setDiscount(newDiscount);
    setFinalTotal(Math.max(0, newTotal - newDiscount));
  }, [items, isLoaded, appliedCoupon]);

  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      if (existingItem) {
        return currentItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cart_coupon');
      } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
      }
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, items })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, message: data.error || 'Ogiltig rabattkod' };
      }
      const coupon: AppliedCoupon = {
        code: data.code,
        type: data.type,
        amount: data.amount,
        appliesTo: Array.isArray(data.appliesTo) ? data.appliesTo : 'all'
      };
      setAppliedCoupon(coupon);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Kunde inte validera rabattkod' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      isLoaded,
      discount,
      finalTotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 
