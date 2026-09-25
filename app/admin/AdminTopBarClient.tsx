'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, LogOut, Database } from 'lucide-react';

export default function AdminTopBarClient({ isSupabaseActive }: { isSupabaseActive: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/adlogin');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          className={`admin-badge ${isSupabaseActive ? 'badge-success' : 'badge-warning'}`}
          title={
            isSupabaseActive
              ? 'Connected to Supabase Database'
              : 'Using Local Store. Configure NEXT_PUBLIC_SUPABASE_URL in .env.local to link Supabase.'
          }
        >
          <Database size={14} />
          <span>{isSupabaseActive ? 'Supabase Active' : 'Local Fallback Mode'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          href="/"
          target="_blank"
          className="admin-btn admin-btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          <ExternalLink size={16} />
          <span>View Live Site</span>
        </Link>

        <button onClick={handleLogout} className="admin-btn admin-btn-danger">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
