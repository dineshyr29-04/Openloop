import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Gauge, Map, MapPin, Users, UsersRound, X, ExternalLink, Mail, Github } from 'lucide-react';
import gsap from 'gsap';
import './TopSelected25.css';

interface TeamMember {
  name: string;
  designation: string;
  photo: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export const TopSelected25: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sample data for teams with members
  const teams: Team[] = [
    { 
      id: 'OL01', 
      name: 'Alt F4',
      members: [
        { name: 'Adarsh', designation: 'Team Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adarsh' },
        { name: 'Ananya', designation: 'Developer', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
        { name: 'Karthik', designation: 'UI/UX', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik' }
      ]
    },
    { id: 'OL02', name: "Karan's Team", members: [{ name: 'Karan', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan' }] },
    { id: 'OL03', name: 'ByteBots', members: [{ name: 'Sohan', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sohan' }] },
    { id: 'OL04', name: 'Code Burglars', members: [{ name: 'Rahul', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' }] },
    { id: 'OL05', name: 'Algo Boys', members: [{ name: 'Vikram', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' }] },
    { id: 'OL06', name: 'ButterByte', members: [{ name: 'Neha', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha' }] },
    { id: 'OL07', name: 'OpenSHA', members: [{ name: 'Sam', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' }] },
    { id: 'OL08', name: 'AAF11', members: [{ name: 'Aryan', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan' }] },
    { id: 'OL09', name: 'System Crash', members: [{ name: 'Priya', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' }] },
    { id: 'OL10', name: 'Evo', members: [{ name: 'Eshan', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eshan' }] },
    { id: 'OL11', name: 'SquidWardDevs', members: [{ name: 'Patrick', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patrick' }] },
    { id: 'OL12', name: 'Code Ninjas', members: [{ name: 'Hattori', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hattori' }] },
    { id: 'OL13', name: 'Dot&Key', members: [{ name: 'Keya', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Keya' }] },
    { id: 'OL14', name: 'ZenithAI', members: [{ name: 'Zane', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zane' }] },
    { id: 'OL15', name: 'rohan', members: [{ name: 'Rohan', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' }] },
    { id: 'OL16', name: 'Loop Crackers', members: [{ name: 'Lokesh', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lokesh' }] },
    { id: 'OL17', name: 'The Faah Sparrow', members: [{ name: 'Jack', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' }] },
    { id: 'OL18', name: 'Yen Quads', members: [{ name: 'Yen', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yen' }] },
    { id: 'OL19', name: 'Code Crafters', members: [{ name: 'Chetan', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chetan' }] },
    { id: 'OL20', name: 'Isaac', members: [{ name: 'Newton', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Newton' }] },
    { id: 'OL21', name: 'Simple coders', members: [{ name: 'Simran', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Simran' }] },
    { id: 'OL22', name: 'Next-gen', members: [{ name: 'Naveen', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Naveen' }] },
    { id: 'OL23', name: 'QuantumCoders', members: [{ name: 'Quincy', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quincy' }] },
    { id: 'OL24', name: 'Kai', members: [{ name: 'Kai', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai' }] },
    { id: 'OL25', name: 'Hacktivators', members: [{ name: 'Hema', designation: 'Lead', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hema' }] },
  ];

  const achievements = [
    { value: '309', label: 'Total participants', hint: 'Makers who joined OpenLoop', tone: '#7da2ff', icon: Users },
    { value: '121', label: 'Total teams', hint: 'Strong collaborative entries', tone: '#52ebff', icon: UsersRound },
    { value: '109', label: 'Total colleges', hint: 'Campuses represented', tone: '#eb2675', icon: Building2 },
    { value: '14', label: 'Total states', hint: 'Regional spread across India', tone: '#ffd88a', icon: Map },
    { value: '58', label: 'Total cities', hint: 'Urban and semi-urban participation', tone: '#d5b7ff', icon: MapPin },
    { value: '70%', label: 'Completion rate', hint: 'Teams that shipped end-to-end', tone: '#e4ebff', icon: Gauge },
  ];

  useEffect(() => {
    if (selectedTeam) {
      const tl = gsap.timeline();
      tl.fromTo(overlayRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      tl.fromTo(modalRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
        '-=0.2'
      );
    }
  }, [selectedTeam]);

  const closePortal = () => {
    const tl = gsap.timeline({ onComplete: () => setSelectedTeam(null) });
    tl.to(modalRef.current, { scale: 0.8, opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' });
    tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
  };

  return (
    <div className="selected-page">
      <div className="selected-bg" />

      <div className="selected-wrap">
        <button onClick={() => navigate('/')} className="selected-back-btn">
          <ArrowLeft size={16} /> BACK TO HUB
        </button>

        <h1 className="selected-title">SHORT LISTED SELECTED 25</h1>
        <p className="selected-subtitle">Official shortlisted teams. Click a card to view crew members.</p>

        <div className="teams-grid">
          {teams.map((team, index) => (
            <article 
              key={team.id} 
              className={`team-card-item ${selectedTeam?.id === team.id ? 'active' : ''}`}
              onClick={() => setSelectedTeam(team)}
            >
              <div className="card-scanner" />
              <div className="team-card-meta">
                <div className="team-id-block">
                  <span className="team-field-label">TEAM ID</span>
                  <span className="team-id-pill">{team.id}</span>
                </div>
                <span className="team-rank-pill">#{String(index + 1).padStart(2, '0')}</span>
              </div>

              <span className="team-field-label team-name-field-label">TEAM NAME</span>
              <div className="team-name-text" title={team.name}>{team.name}</div>

              <div className="team-card-foot">
                <span className="team-tag">VIEW CREW DETAILS</span>
                <Users size={14} className="team-icon-hint" />
              </div>

              <div className="team-card-corner" />
              <div className="card-glitch-layer" />
            </article>
          ))}
        </div>

        {/* Team Members Modal */}
        {selectedTeam && (
          <div className="member-portal-overlay" ref={overlayRef} onClick={closePortal}>
            <div className="member-portal-modal" ref={modalRef} onClick={e => e.stopPropagation()}>
              <div className="portal-header">
                <div className="portal-title-group">
                  <span className="portal-kicker">TEAM DOSSIER // {selectedTeam.id}</span>
                  <h2 className="portal-title">{selectedTeam.name}</h2>
                </div>
                <button className="portal-close" onClick={closePortal}>
                  <X size={24} />
                </button>
              </div>

              <div className="portal-grid">
                {selectedTeam.members.map((member, idx) => (
                  <div key={idx} className="member-cyber-card">
                    <div className="member-photo-frame">
                      <img src={member.photo} alt={member.name} className="member-photo" />
                      <div className="photo-scan-line" />
                    </div>
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-designation">{member.designation}</p>
                      <div className="member-links">
                        <Github size={14} />
                        <Mail size={14} />
                        <ExternalLink size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="portal-footer">
                <div className="portal-status-bar">
                  <span className="status-dot" />
                  <span className="status-text">MEMBERS_LOADED: {selectedTeam.members.length}</span>
                </div>
                <div className="portal-tech-info">OPENLOOP_CORE_v2.0</div>
              </div>
            </div>
          </div>
        )}

        <section className="achievements-section" aria-labelledby="registration-stats-title">
          <div className="achievements-head">
            <p className="achievements-kicker">HACKATHON ACHIEVEMENTS</p>
            <h2 id="registration-stats-title" className="achievements-title">Registration Stats</h2>
            <p className="achievements-subtitle">These numbers highlight the reach and impact of OpenLoop.</p>
          </div>

          <div className="achievements-highlight-strip">
            <div className="achievements-highlight-item">
              <span className="highlight-number">300+</span>
              <span className="highlight-label">Participants</span>
            </div>
            <div className="achievements-highlight-item">
              <span className="highlight-number">120+</span>
              <span className="highlight-label">Teams</span>
            </div>
            <div className="achievements-highlight-item">
              <span className="highlight-number">100+</span>
              <span className="highlight-label">Colleges</span>
            </div>
          </div>

          <div className="achievements-body">
            <p className="achievements-story">
              OpenLoop attracted a strong multi-city, multi-campus community. With teams coming from 14 states and 58 cities.
            </p>

            <ul className="achievement-flow-list" aria-label="Detailed registration statistics">
              {achievements.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="achievement-flow-item" style={{ '--tone': item.tone } as React.CSSProperties}>
                    <span className="achievement-flow-icon"><Icon size={16} /></span>
                    <span className="achievement-flow-label">{item.label}</span>
                    <span className="achievement-flow-value">{item.value}</span>
                    <span className="achievement-flow-hint">{item.hint}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

