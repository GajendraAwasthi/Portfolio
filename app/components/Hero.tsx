'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, Download, ChevronDown } from 'lucide-react';
import { ProfileHero } from '@/types/portfolio';

interface HeroProps {
  profile: ProfileHero;
  onOpenTerminal: () => void;
}

export default function Hero({ profile, onOpenTerminal }: HeroProps) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const phrases = profile.headlineTyping && profile.headlineTyping.length > 0
    ? profile.headlineTyping
    : ['CS Student', 'Developer', 'Cybersecurity Enthusiast'];

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex] || '';

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          // Pause at end of word
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentPhrase.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases]);

  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = profile.resumeUrl || '/src/CV_GajendraAwasthi.pdf';
    link.download = 'CV_GajendraAwasthi.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <section className="hero" id="home">
      <div className="container hero-content">
        <div className="hero-avatar-wrapper">
          <img
            src={profile.avatarUrl || 'https://i.postimg.cc/bw9X1Z98/Forest-Modern-Minimal-Music-Album-Cover-(2).png'}
            alt={`${profile.name} ${profile.surnameGradient}`}
            className="hero-avatar"
          />
        </div>

        <h1>
          {profile.name} <span className="gradient-text">{profile.surnameGradient}</span>
        </h1>

        <div className="typing-container">
          <span>{displayText}</span>
          <span className="typing-cursor" />
        </div>

        <p className="hero-description">{profile.description}</p>

        <div className="cta-group">
          <a
            href={`#${profile.ctaButtons?.viewWorkTarget || 'projects'}`}
            className="btn btn-primary"
          >
            <span>{profile.ctaButtons?.viewWorkText || 'View My Work'}</span>
            <ArrowRight size={18} />
          </a>

          <button className="btn btn-secondary" onClick={onOpenTerminal}>
            <Terminal size={18} />
            <span>{profile.ctaButtons?.terminalButtonText || 'Use Terminal'}</span>
          </button>

          <button className="btn btn-secondary" onClick={handleDownloadCV}>
            <Download size={18} />
            <span>{profile.ctaButtons?.resumeButtonText || 'Download CV'}</span>
          </button>
        </div>

        <div className="scroll-indicator">
          <span>Scroll to explore &amp; Shake to cure bore</span>
          <ChevronDown size={20} />
        </div>
      </div>
    </section>
  );
}
