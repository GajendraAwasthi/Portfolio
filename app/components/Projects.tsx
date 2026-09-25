import React from 'react';
import { ExternalLink, Code2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import { ProjectItem } from '@/types/portfolio';

interface ProjectsProps {
  projects: ProjectItem[];
}

export default function Projects({ projects }: ProjectsProps) {
  const activeProjects = projects
    .filter((p) => p.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <section id="projects">
      <div className="container">
        <h2 className="section-title">
          Featured <span className="gradient-text">Projects</span>
        </h2>

        <div className="projects-grid">
          {activeProjects.map((project) => (
            <div key={project.id} className="project-card glass">
              <div>
                <h3>
                  <Code2 size={24} color="#2563eb" />
                  <span>{project.title}</span>
                </h3>
                <p className="project-desc">{project.description}</p>
                {project.team && (
                  <p className="project-team">
                    <strong>Team:</strong> {project.team}
                  </p>
                )}
              </div>

              <div>
                {project.tags && project.tags.length > 0 && (
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="project-links">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.88rem', padding: '0.5rem 1.1rem' }}
                    >
                      <GithubIcon size={16} /> View on GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ fontSize: '0.88rem', padding: '0.5rem 1.1rem' }}
                    >
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
