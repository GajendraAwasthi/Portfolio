'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AboutCard, StatCounter } from '@/types/portfolio';

interface AboutProps {
  cards: AboutCard[];
  stats: StatCounter[];
}

function AnimatedStat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(current);
            }
          }, 35);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="stat-item" ref={elementRef}>
      <div className="stat-number">
        {count}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function About({ cards, stats }: AboutProps) {
  const activeCards = cards.filter((c) => c.is_active);
  const activeStats = stats.filter((s) => s.is_active);

  return (
    <section id="about">
      <div className="container">
        <h2 className="section-title">
          About <span className="gradient-text">Me</span>
        </h2>

        <div className="about-grid">
          {activeCards.map((card) => (
            <div key={card.id} className="about-card glass">
              <div className="about-card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>

        {activeStats.length > 0 && (
          <div className="stats-grid">
            {activeStats.map((stat) => (
              <AnimatedStat
                key={stat.id}
                target={stat.target_number}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
