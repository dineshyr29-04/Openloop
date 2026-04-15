import React from 'react';
import { lerp } from '../utils/math';

interface FooterSectionProps {
  scrollVal: number;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ scrollVal }) => {
  const isVisible = scrollVal >= 0.96;

  if (!isVisible) return null;

  return (
    <footer
      id="footer-section"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100vh',
        background: 'transparent',
        color: '#fff',
        pointerEvents: 'auto',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        borderTop: '1px solid rgba(198, 255, 0, 0.1)',
      }}
    >
      {/* Empty space at the top as requested (making it larger to push content down) */}
      <div style={{
          height: '50vh',
          width: '100%',
          pointerEvents: 'none'
      }} />

      <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%',
          padding: '40px',
          paddingBottom: '40px',
          display: 'grid',
          gridTemplateColumns: isVisible ? '1.5fr 1fr 1fr 1fr' : '1fr', // Simplify for animation
          gap: '40px',
          position: 'relative',
          background: 'rgba(7, 2, 2, 0.71)',
          borderRadius: '8px',
          transform: `translateY(${lerp(100, 0, (scrollVal - 0.98) / 0.02)}px)`,
          opacity: (scrollVal - 0.98) / 0.02,
          transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease'
      }}>
        {/* Brand Column */}
        <div className="footer-col" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ 
              fontFamily: 'Audiowide, sans-serif', 
              fontSize: '30px', 
              letterSpacing: '2px',
              background: 'linear-gradient(to bottom, #C6FF00, #9c5c5c)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
          }}>OPENLOOP</h3>
          <p style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '1.6',
              maxWidth: '300px'
          }}>
            Pushing the boundaries of decentralized innovation. Join the next generation of building.
          </p>
        </div>

        {/* Navigation */}
        <div className="footer-col" style={{ animationDelay: '0.2s' }}>
          <h4 style={headerStyle}>Navigation</h4>
          <ul style={listStyle}>
            <li><a href="#about" style={linkStyle}>About</a></li>
            <li><a href="#themes" style={linkStyle}>Themes</a></li>
            <li><a href="#timeline" style={linkStyle}>Timeline</a></li>
            <li><a href="#sponsors" style={linkStyle}>Sponsors</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col" style={{ animationDelay: '0.3s' }}>
          <h4 style={headerStyle}>Connect</h4>
          <ul style={listStyle}>
            <li><a href="mailto:hello@openloop.dev" style={linkStyle}>Email</a></li>
            <li><a href="https://www.instagram.com/yentech.community/" style={linkStyle}>Instagram</a></li>
            <li><a href="https://www.linkedin.com/in/yentech-community-964369402/" style={linkStyle}>LinkedIn</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-col" style={{ animationDelay: '0.4s' }}>
          <h4 style={headerStyle}>Legal</h4>
          <ul style={listStyle}>
            <li><a href="#" style={linkStyle}>Privacy Policy</a></li>
            <li><a href="#" style={linkStyle}>Terms of Service</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
          marginTop: '60px',
          paddingTop: '30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          maxWidth: '1200px',
          margin: '60px auto 0 auto',
          width: '100%',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.3)',
          letterSpacing: '1px',
          transform: `translateY(${lerp(40, 0, (scrollVal - 0.99) / 0.01)}px)`,
          opacity: (scrollVal - 0.99) / 0.01
      }}>
        <span>© 2026 OPENLOOP HACKATHON. ALL RIGHTS RESERVED.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>YENTECH</span>
          <span style={{ color: '#C6FF00' }}>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

const headerStyle: React.CSSProperties = {
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 700,
    fontSize: '15px',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '20px'
};

const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

const linkStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
};
