'use client';

import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import { CertificationItem } from '@/types/portfolio';

interface CertificationsProps {
  certifications: CertificationItem[];
}

export default function Certifications({ certifications }: CertificationsProps) {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);

  const activeCerts = certifications
    .filter((c) => c.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <section id="certifications">
      <div className="container">
        <h2 className="section-title">
          Certifications & <span className="gradient-text">Awards</span>
        </h2>
        <p className="section-subtitle">Click any certificate to view high-resolution image</p>

        <div className="cert-gallery">
          {activeCerts.map((cert) => (
            <div
              key={cert.id}
              className="cert-item"
              onClick={() => setSelectedCert(cert)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedCert(cert)}
            >
              <img
                src={cert.imageUrl}
                alt={cert.title}
                className="cert-img"
                loading="lazy"
              />
              <div className="cert-overlay">
                <ZoomIn size={28} />
                <div className="cert-overlay-title">{cert.title}</div>
                {cert.issuer && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '4px' }}>
                    {cert.issuer}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedCert && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setSelectedCert(null)}
              aria-label="Close certificate lightbox"
            >
              <X size={32} />
            </button>
            <img
              src={selectedCert.imageUrl}
              alt={selectedCert.title}
              className="lightbox-img"
            />
            <div style={{ marginTop: '1rem', color: '#ffffff', textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedCert.title}</h4>
              {selectedCert.issuer && (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Issuer: {selectedCert.issuer}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
