'use client';

import React, { useState } from 'react';
import { PortfolioData } from '@/types/portfolio';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Education from './components/Education';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Videos from './components/Videos';
import Footer from './components/Footer';
import TerminalModal from './components/TerminalModal';
import AudioEasterEgg from './components/AudioEasterEgg';
import BackToTop from './components/BackToTop';

export default function PortfolioClient({ data }: { data: PortfolioData }) {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient background glowing orbs */}
      <div className="bg-orb bg-orb-one" aria-hidden="true" />
      <div className="bg-orb bg-orb-two" aria-hidden="true" />

      {/* Header */}
      <Header
        profile={data.profile}
        onOpenTerminal={() => setTerminalOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        <Hero
          profile={data.profile}
          onOpenTerminal={() => setTerminalOpen(true)}
        />
        <About cards={data.aboutCards} stats={data.stats} />
        <Education education={data.education} />
        <Skills skills={data.skills} />
        <Certifications certifications={data.certifications} />
        <Projects projects={data.projects} />
        <Experience experience={data.experience} />
        <Videos videos={data.videos} />
      </main>

      {/* Footer */}
      <Footer profile={data.profile} settings={data.settings} />

      {/* Interactive Terminal Modal */}
      <TerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        commands={data.terminalCommands}
        resumeUrl={data.profile.resumeUrl}
      />

      {/* Audio Easter Egg & Attention blink */}
      <AudioEasterEgg settings={data.settings} />

      {/* Back to top smooth button */}
      <BackToTop />
    </div>
  );
}
