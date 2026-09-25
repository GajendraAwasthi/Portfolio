'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, Shield, Menu, X } from 'lucide-react';
import { ProfileHero } from '@/types/portfolio';

interface HeaderProps {
  profile: ProfileHero;
  onOpenTerminal: () => void;
}

export default function Header({ profile, onOpenTerminal }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'education', 'skills', 'certifications', 'projects', 'experience', 'videos'];
      const scrollY = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Education', href: '#education' },
    { label: 'Skills', href: '#skills' },
    { label: 'Certificates', href: '#certifications' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Videos', href: '#videos' },
  ];

  return (
    <header className="site-header">
      <div className="container header-nav">
        <a href="#home" className="brand-logo">
          <Shield size={24} color="#2563eb" />
          <span>
            {profile.name} <span className="gradient-text">{profile.surnameGradient}</span>
          </span>
        </a>

        <ul className="nav-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={activeSection === item.href.slice(1) ? 'active' : ''}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button
            className="terminal-toggle-btn"
            onClick={onOpenTerminal}
            aria-label="Open Interactive Terminal"
          >
            <Terminal size={16} />
            <span>Terminal</span>
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-h)',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            borderBottom: '1px solid #e2e8f0',
            zIndex: 99,
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: activeSection === item.href.slice(1) ? 'var(--primary)' : '#334155',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTerminal();
              }}
            >
              <Terminal size={18} /> Open Terminal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
