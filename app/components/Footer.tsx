import React from 'react';
import { Shield, Mail } from 'lucide-react';
import { LinkedinIcon, GithubIcon, FacebookIcon, TwitterIcon } from './Icons';
import { ProfileHero, SiteSettings } from '@/types/portfolio';

interface FooterProps {
  profile: ProfileHero;
  settings: SiteSettings;
}

export default function Footer({ profile, settings }: FooterProps) {
  const socials = profile.socialLinks || {};

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <h3>
          {settings.footerTagline?.split('Extraordinary')[0]}
          <span className="gradient-text">Extraordinary Together</span>
        </h3>
        <p className="footer-subtext">{settings.footerSubtext}</p>

        <div className="social-links">
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="LinkedIn Profile"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={20} />
            </a>
          )}
          {socials.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="GitHub Profile"
              aria-label="GitHub"
            >
              <GithubIcon size={20} />
            </a>
          )}
          {socials.tryhackme && (
            <a
              href={socials.tryhackme}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="TryHackMe Profile"
              aria-label="TryHackMe"
            >
              <Shield size={20} />
            </a>
          )}
          {socials.facebook && (
            <a
              href={socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="Facebook Profile"
              aria-label="Facebook"
            >
              <FacebookIcon size={20} />
            </a>
          )}
          {socials.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title="Twitter Profile"
              aria-label="Twitter"
            >
              <TwitterIcon size={20} />
            </a>
          )}
          {profile.contactEmail && (
            <a
              href={`mailto:${profile.contactEmail}?subject=Query/Hire%20Message%20From%20Portfolio%20Site`}
              className="social-link"
              title="Send Direct Email"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          )}
        </div>

        <p className="footer-meta">
          &copy; {new Date().getFullYear()}{' '}
          <a href="#home" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            {settings.footerOwner || profile.name}
          </a>{' '}
          | Crafted with <span style={{ color: '#ef4444' }}>&hearts;</span> for excellence. All rights reserved.
        </p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#94a3b8' }}>
          {settings.lastUpdatedText || 'Updated: 2026 | Next.js CMS'}
        </p>
      </div>
    </footer>
  );
}
