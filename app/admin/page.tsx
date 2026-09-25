import React from 'react';
import Link from 'next/link';
import { getPortfolioData, checkSupabaseStatus } from '@/lib/data-service';
import {
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
  FolderGit2,
  Video,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const data = await getPortfolioData();
  const dbStatus = await checkSupabaseStatus();

  const cards = [
    {
      title: 'Education',
      count: data.education.length,
      subtitle: `${data.education.filter((e) => e.is_active).length} Active records`,
      icon: GraduationCap,
      href: '/admin/education',
      color: '#3b82f6',
    },
    {
      title: 'Experience',
      count: data.experience.length,
      subtitle: `${data.experience.filter((e) => e.is_active).length} Active roles`,
      icon: Briefcase,
      href: '/admin/experience',
      color: '#8b5cf6',
    },
    {
      title: 'Skills & Tech',
      count: data.skills.length,
      subtitle: `${Array.from(new Set(data.skills.map((s) => s.category))).length} Categories`,
      icon: Wrench,
      href: '/admin/skills',
      color: '#06b6d4',
    },
    {
      title: 'Certificates',
      count: data.certifications.length,
      subtitle: `${data.certifications.filter((c) => c.is_active).length} Displayed in gallery`,
      icon: Award,
      href: '/admin/certifications',
      color: '#f59e0b',
    },
    {
      title: 'Projects',
      count: data.projects.length,
      subtitle: `${data.projects.filter((p) => p.is_active).length} Featured showcases`,
      icon: FolderGit2,
      href: '/admin/projects',
      color: '#10b981',
    },
    {
      title: 'YouTube Videos',
      count: data.videos.length,
      subtitle: `${data.videos.filter((v) => v.is_active).length} Tutorial embeds`,
      icon: Video,
      href: '/admin/videos',
      color: '#ef4444',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-header-title">CMS Dashboard Overview</h1>
        <p className="admin-header-sub">
          Manage, add, and update any section of your portfolio directly from this panel.
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <div
        className="admin-card"
        style={{
          borderLeft: `4px solid ${dbStatus.connected ? '#10b981' : '#f59e0b'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: dbStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={24} color={dbStatus.connected ? '#10b981' : '#f59e0b'} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>
              Database Status: {dbStatus.connected ? 'Supabase Connected' : 'Local Fallback Storage Active'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              {dbStatus.message}
            </p>
          </div>
        </div>

        <Link href="/admin/settings" className="admin-btn admin-btn-primary">
          <span>Configure Database &amp; Sync</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              href={c.href}
              className="admin-card"
              style={{
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>
                  {c.title}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${c.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={c.color} />
                </div>
              </div>

              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1, marginBottom: '0.5rem' }}>
                {c.count}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{c.subtitle}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Card */}
      <div className="admin-card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem' }}>
          Quick CMS Actions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/admin/education" className="admin-btn admin-btn-secondary">
            <GraduationCap size={16} /> Add New Education
          </Link>
          <Link href="/admin/experience" className="admin-btn admin-btn-secondary">
            <Briefcase size={16} /> Add New Experience
          </Link>
          <Link href="/admin/projects" className="admin-btn admin-btn-secondary">
            <FolderGit2 size={16} /> Add New Project
          </Link>
          <Link href="/admin/certifications" className="admin-btn admin-btn-secondary">
            <Award size={16} /> Add Certificate
          </Link>
          <Link href="/admin/profile" className="admin-btn admin-btn-secondary">
            <ArrowRight size={16} /> Edit Profile &amp; Bio
          </Link>
        </div>
      </div>
    </div>
  );
}
