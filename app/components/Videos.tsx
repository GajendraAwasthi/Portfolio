import React from 'react';
import { VideoItem } from '@/types/portfolio';

interface VideosProps {
  videos: VideoItem[];
}

export default function Videos({ videos }: VideosProps) {
  const activeVideos = videos
    .filter((v) => v.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <section id="videos">
      <div className="container">
        <h2 className="section-title">
          YouTube <span className="gradient-text">Tutorials &amp; Tech Content</span>
        </h2>
        <p className="section-subtitle">
          Hands-on technical tutorials, guides, and practical developer walkthroughs
        </p>

        <div className="video-grid">
          {activeVideos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-frame-wrap">
                <iframe
                  src={`https://www.youtube.com/embed/${video.embedId}`}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
