'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Ordrar</h1>
        <p className="text-[var(--text-secondary)]">Hantera kundordrar</p>
      </div>
      
      <div className="admin-card">
        <p className="text-center text-[var(--text-secondary)]">
          Orderhantering kommer snart...
        </p>
      </div>
    </div>
  );
}
