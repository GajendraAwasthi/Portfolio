import React from 'react';
import { Briefcase } from 'lucide-react';
import { ExperienceItem } from '@/types/portfolio';

interface ExperienceProps {
  experience: ExperienceItem[];
}

export default function Experience({ experience }: ExperienceProps) {
  const activeExp = experience
    .filter((e) => e.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <section id="experience">
      <div className="container">
        <h2 className="section-title">
          Professional <span className="gradient-text">Experience</span>
        </h2>

        <div className="experience-grid">
          {activeExp.map((exp) => (
            <div key={exp.id} className="exp-card glass">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Briefcase size={20} color="#2563eb" />
                <h3>{exp.company}</h3>
              </div>
              <div className="exp-role">{exp.role}</div>
              <div className="exp-duration">{exp.duration}</div>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
