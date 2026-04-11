import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { lerp, clamp } from '../utils/math';

interface TimelineEvent {
  title: string;
  date: string;
  desc: string;
  range: [number, number];
}

const TIMELINE_DATA: TimelineEvent[] = [
  { title: 'Registration Opens', date: 'TBA', desc: 'Secure your spot and start forming your team.', range: [0.550, 0.588] },
  { title: 'Kickoff & Opening', date: 'TBA', desc: 'Get briefed, meet participants, and dive into the challenge.', range: [0.588, 0.626] },
  { title: 'Hacking Begins', date: 'TBA', desc: 'The clock starts. Build, break, and iterate.', range: [0.626, 0.664] },
  { title: 'Mentorship & Checkpoints', date: 'TBA', desc: 'Refine your idea with expert feedback and stay on track.', range: [0.664, 0.702] },
  { title: 'Project Submission', date: 'TBA', desc: 'Submit your final build and prepare to showcase.', range: [0.702, 0.740] },
  { title: 'Final Presentations', date: 'TBA', desc: 'Pitch your project to judges and the community.', range: [0.740, 0.778] },
  { title: 'Winners Announced', date: 'TBA', desc: 'Celebrating the best builds, bold ideas, and standout teams.', range: [0.778, 0.816] },
];

export const Timeline3D: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const p = scrollProgress;
  // Deterministic Kill-Switch
  if (p < 0.52 || p > 0.83) return null;

  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // We'll spread nodes along the X axis - Tightened for multiple visibility
  const spacing = 2.2;
  const startX = -((TIMELINE_DATA.length - 1) * spacing) / 2;
  const totalWidth = (TIMELINE_DATA.length - 1) * spacing;

  useFrame((state) => {
    if (!groupRef.current) return;

    const p = scrollProgress;
    
    // 1. Core Timeline Movement (0.55 -> 0.82)
    const timelineP = clamp((p - 0.55) / 0.27, 0, 1);
    
    // Move horizontally centered around nodes
    const targetXOffset = -startX - (timelineP * totalWidth);
    groupRef.current.position.x = lerp(groupRef.current.position.x, targetXOffset, 0.1);

    // 2. Traveling Light Pulse
    if (pulseRef.current) {
      const pulseX = startX + (timelineP * (TIMELINE_DATA.length - 1) * spacing);
      pulseRef.current.position.x = pulseX;
      pulseRef.current.position.y = 0;
      pulseRef.current.visible = timelineP > 0 && timelineP < 1;
      
      const material = pulseRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 1;
    }

    // 3. Cinematic Intro/Exit Transition
    let opacity = 0;

    if (p >= 0.52 && p < 0.83) {
      // Entry Fade (0.52 -> 0.55)
      if (p < 0.55) {
        opacity = (p - 0.52) / 0.03;
      } 
      // Main Body (0.55 -> 0.75)
      else if (p < 0.75) {
        opacity = 1;
      }
      // Cinematic Exit (0.75 -> 0.82)
      else {
        const exitP = clamp((p - 0.75) / 0.07, 0, 1);
        opacity = 1 - exitP;
      }
    }

    groupRef.current.position.y = 0.5; // Locked Y - No Bouncing
    groupRef.current.visible = opacity > 0;
  });

  return (
    <group ref={groupRef} position={[0, 0.5, -2]}>
      {/* Main Track Line */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 30, 8]} />
        <meshStandardMaterial color="#C6FF00" emissive="#C6FF00" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>

      {/* Traveling Data Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#C6FF00" emissiveIntensity={3} />
        <pointLight color="#C6FF00" intensity={1} distance={2} />
      </mesh>

      {/* Nodes */}
      {TIMELINE_DATA.map((event, i) => {
        const xPos = startX + i * spacing;
        const isLeft = i % 2 !== 0; // Alternating

        return (
          <Node 
            key={i} 
            event={event} 
            xPos={xPos} 
            isLeft={isLeft} 
            scrollProgress={scrollProgress}
            sectionOpacity={clamp((scrollProgress - 0.75) / 0.07, 0, 1)} // Sync with expanded exit
          />
        );
      })}
    </group>
  );
};

interface NodeProps {
  event: TimelineEvent;
  xPos: number;
  isLeft: boolean;
  scrollProgress: number;
  sectionOpacity: number;
}

const Node: React.FC<NodeProps> = ({ event, xPos, isLeft, scrollProgress, sectionOpacity }) => {
  const meshRef = useRef<THREE.Group>(null);
  const p = scrollProgress;
  
  // Calculate state
  const isActive = p >= event.range[0] && p < event.range[1];
  const isCompleted = p >= event.range[1];
  const isPending = p < event.range[0];

  // Global fade factor (1 during active, fades to 0 during section exit)
  const globalFade = 1 - sectionOpacity;

  useFrame(() => {
    if (!meshRef.current) return;

    // Locked scale - No Pulse
    meshRef.current.scale.set(1, 1, 1);
  });

  const nodeColor = isActive ? "#C6FF00" : (isCompleted ? "#88aa00" : "#222222");
  const glowIntensity = isActive ? 2 : (isCompleted ? 0.5 : 0.1);

  return (
    <group position={[xPos, 0, 0]} ref={meshRef}>
      {/* Node Geometry */}
      <mesh>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial 
          color={nodeColor} 
          emissive={nodeColor} 
          emissiveIntensity={glowIntensity} 
          transparent 
          opacity={(isPending ? 0.4 : 1) * globalFade}
        />
      </mesh>

      {/* Label Panel */}
      <Html
        position={[0, isLeft ? -1.2 : 1.2, 0]}
        center
        distanceFactor={10}
        style={{
          transition: 'opacity 0.5s ease', // Smooth opacity, removed transform bouncing
          opacity: (isActive ? 1 : (isCompleted ? 0.5 : 0)) * globalFade,
          pointerEvents: 'none'
        }}
      >
        <div className="t3d-panel" style={{
          background: 'rgba(0,0,0,0.9)',
          borderLeft: `3px solid ${nodeColor}`,
          padding: '16px',
          width: '20  0px',
          borderRadius: '4px',
          boxShadow: `0 0 30px rgba(0,0,0,0.6), inset 0 0 15px ${isActive ? 'rgba(198,255,0,0.15)' : 'transparent'}`,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(198,255,0,0.1)',
          color: 'white',
          fontFamily: "'Share Tech Mono', monospace"
        }}>
          <div style={{ fontSize: '12px', color: '#C6FF00', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '2px' }}>
            {event.date}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
            {event.title}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
            {event.desc}
          </div>
        </div>
      </Html>
    </group>
  );
};
