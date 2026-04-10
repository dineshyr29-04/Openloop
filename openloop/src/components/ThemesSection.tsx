import React from 'react';
import './ThemesSection.css';
import { lerp, clamp } from '../utils/math';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const CARDS_DATA = [
  { id: 1, title: 'Learning and developer productivity' },
  { id: 2, title: 'Healthcare and Medtech' },
  { id: 3, title: 'FineTech & Banking' },
  { id: 4, title: 'Open Innovation' }
];

export const ThemesSection: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const p = scrollProgress;
  // Local Range: 0.36 -> 0.55
  const isInRange = p >= 0.36 && p <= 0.55;
  const lp = clamp((p - 0.36) / (0.55 - 0.36), 0, 1);
  
  // Section entrance opacity
  let sectionOp = 0;
  const ramp = 0.10;
  if (lp < ramp) sectionOp = lp / ramp;
  else if (lp <= (1 - ramp)) sectionOp = 1;
  else sectionOp = (1 - lp) / ramp;

  const themeP = clamp(lp / 0.25, 0, 1); // Full entry by 25% of the range

  return (
    <div 
      id="theme-section" 
      className="section-overlay"
      style={{ 
        opacity: sectionOp,
        visibility: sectionOp > 0.001 ? 'visible' : 'hidden',
        pointerEvents: sectionOp > 0.5 ? 'auto' : 'none',
        zIndex: sectionOp > 0.05 ? 100 : 10
      }}
    >
      <div className="theme-label">THEMES</div>
      <div className="themes-relative-wrapper">
        {CARDS_DATA.map((card, index) => {
          const staggerP = clamp((themeP - index * 0.1) / 0.7, 0, 1);
          
          let x = 0;
          let scale = 1;
          const cardZIndex = 110 + index;
          
          if (staggerP < 1.0) {
            x = lerp(-60, -12 * (CARDS_DATA.length - 1 - index), easeOut(staggerP));
            scale = lerp(1.1, 1 - index * 0.04, staggerP);
          } else {
            x = -12 * (CARDS_DATA.length - 1 - index);
            scale = 1 - index * 0.04;
          }

          return (
            <div
              key={card.id}
              id={`card-${index + 1}`}
              className="theme-card"
              style={{
                top: '50%',
                left: '50%',
                transform: `translateX(calc(${x}vw - 50%)) translateY(-50%) scale(${scale})`,
                opacity: clamp(sectionOp * 2, 0, 1),
                zIndex: cardZIndex,
                visibility: sectionOp > 0.1 ? 'visible' : 'hidden'
              }}
            >
              <div className="card-top-accent" />
              <div className="card-content-wrap">
                <span className="card-index">0{index + 1}</span>
                <h3 className="card-title">{card.title}</h3>
                <div className="card-divider" />
                <p className="card-description">
                  Innovation and strategy for {card.title} in a high-intensity hackathon environment.
                </p>
              </div>
              <div className="card-border-glow" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
