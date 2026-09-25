import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import AdminTopBarClient from './AdminTopBarClient';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
  FolderGit2,
  Video,
  Info,
  Terminal,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/adlogin');
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2>Portfolio CMS</h2>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/profile" className="admin-nav-item">
            <User size={18} />
            <span>Profile &amp; Hero</span>
          </Link>
          <Link href="/admin/education" className="admin-nav-item">
            <GraduationCap size={18} />
            <span>Education</span>
          </Link>
          <Link href="/admin/experience" className="admin-nav-item">
            <Briefcase size={18} />
            <span>Experience</span>
          </Link>
          <Link href="/admin/skills" className="admin-nav-item">
            <Wrench size={18} />
            <span>Skills</span>
          </Link>
          <Link href="/admin/certifications" className="admin-nav-item">
            <Award size={18} />
            <span>Certificates</span>
          </Link>
          <Link href="/admin/projects" className="admin-nav-item">
            <FolderGit2 size={18} />
            <span>Projects</span>
          </Link>
          <Link href="/admin/videos" className="admin-nav-item">
            <Video size={18} />
            <span>YouTube Videos</span>
          </Link>
          <Link href="/admin/about" className="admin-nav-item">
            <Info size={18} />
            <span>About &amp; Stats</span>
          </Link>
          <Link href="/admin/terminal" className="admin-nav-item">
            <Terminal size={18} />
            <span>Terminal CLI</span>
          </Link>
          <Link href="/admin/settings" className="admin-nav-item">
            <Settings size={18} />
            <span>Settings &amp; Supabase</span>
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
            Portfolio CMS
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        <AdminTopBarClient isSupabaseActive={isSupabaseConfigured()} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
