import React from 'react';
import { lerp, clamp } from '../utils/math';
import './SponsorsSection.css';

interface Sponsor {
  name: string;
  tier: 'Title' | 'Gold' | 'Silver' | 'Community';
  logo?: string;
}

const SPONSORS: Sponsor[] = [
  { name: "NEURALINK", tier: "Title" },
  { name: "CYBERDYNE", tier: "Gold" },
  { name: "OSCORP", tier: "Gold" },
  { name: "WEYLAND-YUTANI", tier: "Gold" },
  { name: "TYRELL CORP", tier: "Silver" },
  { name: "STARKE IND", tier: "Silver" },
  { name: "UMBRELLA", tier: "Silver" },
  { name: "ENCOM", tier: "Community" },
  { name: "HEXTECH", tier: "Community" },
  { name: "SHINRA", tier: "Community" },
];

export const SponsorsSection: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  // Strict visibility range: 0.70 -> 0.90
  const opacity = clamp((scrollProgress - 0.70) / 0.1, 0, 1) * clamp((0.95 - scrollProgress) / 0.05, 0, 1);
  const translateY = lerp(40, 0, opacity);

  if (opacity <= 0.01) return null;

  return (
    <div 
      id="sponsors-section" 
      className="section-overlay sponsors-container"
      style={{ 
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: opacity > 0.5 ? 'auto' : 'none'
      }}
    >
      <div className="sponsors-header">
        <span className="hud-line"></span>
        <h2 className="glitch-text" data-text="PARTNERS & SPONSORS">PARTNERS & SPONSORS</h2>
        <span className="hud-line"></span>
      </div>

      <div className="sponsors-grid">
        {SPONSORS.map((s, i) => (
          <div key={i} className={`sponsor-card tier-${s.tier.toLowerCase()}`}>
            <div className="card-inner">
              <div className="sponsor-tier">{s.tier}</div>
              <div className="sponsor-logo-placeholder">
                <span className="logo-text">{s.name}</span>
              </div>
              <div className="card-glimmer" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="sponsors-footer">
        <p className="hud-label">Interested in partnering? CONTACT@OPENLOOP.IO</p>
      </div>
    </div>
  );
};
