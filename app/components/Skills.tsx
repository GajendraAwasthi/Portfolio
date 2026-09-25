import React from 'react';
import { SkillItem } from '@/types/portfolio';

interface SkillsProps {
  skills: SkillItem[];
}

export default function Skills({ skills }: SkillsProps) {
  const activeSkills = skills
    .filter((s) => s.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  // Group skills by category
  const categories = Array.from(new Set(activeSkills.map((s) => s.category)));

  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes('program') || lower.includes('dev') || lower.includes('code')) return '👨‍💻';
    if (lower.includes('design') || lower.includes('art') || lower.includes('ui')) return '🎨';
    if (lower.includes('soft') || lower.includes('leadership')) return '💡';
    if (lower.includes('security') || lower.includes('cyber')) return '🛡️';
    return '⚡';
  };

  return (
    <section id="skills">
      <div className="container">
        <h2 className="section-title">
          Skills & <span className="gradient-text">Expertise</span>
        </h2>

        <div className="skills-grid">
          {categories.map((category) => {
            const categorySkills = activeSkills.filter((s) => s.category === category);
            return (
              <div key={category} className="skill-card glass">
                <h3>
                  {getCategoryIcon(category)} {category}
                </h3>
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percent">{skill.percentage}%</span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-progress"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
