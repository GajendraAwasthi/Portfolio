import React from 'react';
import { EducationItem } from '@/types/portfolio';

interface EducationProps {
  education: EducationItem[];
}

export default function Education({ education }: EducationProps) {
  const activeList = education
    .filter((e) => e.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <section id="education">
      <div className="container">
        <h2 className="section-title">
          <span className="gradient-text">Education</span>
        </h2>

        <div className="timeline">
          {activeList.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-content glass">
                <h3>{item.degree}</h3>
                <div className="timeline-year">{item.timeline}</div>
                <p className="timeline-institution">{item.institution}</p>
                {item.stream && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    <strong>Stream:</strong> {item.stream}
                  </p>
                )}
                <p className="timeline-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
