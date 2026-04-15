import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { lerp, clamp } from '../utils/math';

interface InteractiveSphereProps {
  scrollVal: number;
}

type State = 'IDLE' | 'EXPANDING' | 'WAITING' | 'IMPLODING';

export const InteractiveSphere: React.FC<InteractiveSphereProps> = ({ scrollVal }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Points>(null); // Nebula Core
  const [state, setState] = useState<State>('IDLE');
  const [hovered, setHovered] = useState(false);
  const stateRef = useRef<{ progress: number; timer: number; shock: number }>({ progress: 0, timer: 0, shock: 0 });

  // Exclusivity: Only active in footer range
  // Lowered threshold to 0.96 for reliability, but keep opacity 0 until 0.98
  const isEnabled = scrollVal >= 0.96;
  const opacity = clamp((scrollVal - 0.98) / 0.015, 0, 1);

  const particleCount = 8000; // Increased for a denser "perfect" look
  
  // Generate random points on a sphere
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const targets = new Float32Array(particleCount * 3);
    const corePos = new Float32Array(2000 * 3); // Nebula Core
    
    for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        
        const r = 1.6;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        // "Accretion Disk" targets (tilted, varied thickness)
        const angle = Math.random() * Math.PI * 2;
        const dist = 4.5 + Math.random() * 2.5;
        targets[i * 3] = Math.cos(angle) * dist;
        targets[i * 3 + 1] = Math.sin(angle) * dist * 0.3; // Flatter
        targets[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    for (let i = 0; i < 2000; i++) {
      const r = Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      corePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      corePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      corePos[i * 3 + 2] = r * Math.cos(phi);
    }

    return { pos, targets, corePos };
  }, []);

  const handleClick = () => {
    if (state === 'IDLE') {
      setState('EXPANDING');
      stateRef.current.timer = 0;
      stateRef.current.shock = 1; // Trigger shockwave
      // Notify footer of local gravity event
      window.dispatchEvent(new CustomEvent('blackhole_expand', { detail: { active: true } }));
    }
  };

  useFrame((sceneState, delta) => {
    if (!pointsRef.current) return;
    const t = sceneState.clock.elapsedTime;

    // State Machine logic
    if (state === 'EXPANDING') {
      stateRef.current.progress = Math.min(1, stateRef.current.progress + delta * 2.5); // Snappier expansion
      if (stateRef.current.progress >= 1) {
        setState('WAITING');
        stateRef.current.timer = 0;
      }
    } else if (state === 'WAITING') {
      stateRef.current.timer += delta;
      if (stateRef.current.timer >= 5) { // Stay for 5 seconds
        setState('IMPLODING');
        window.dispatchEvent(new CustomEvent('blackhole_expand', { detail: { active: false } }));
      }
    } else if (state === 'IMPLODING') {
      stateRef.current.progress = Math.max(0, stateRef.current.progress - delta * 1.0);
      if (stateRef.current.progress <= 0) {
        setState('IDLE');
      }
    }

    // Shockwave Decay
    stateRef.current.shock = lerp(stateRef.current.shock, 0, 0.05);

    const p = stateRef.current.progress;
    const shock = stateRef.current.shock * Math.sin(t * 10) * 0.5;
    const posAttr = pointsRef.current.geometry.attributes.position;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Organic Turbulence (Noise-like movement)
        const noiseX = Math.sin(t * 1.5 + i) * 0.08;
        const noiseY = Math.cos(t * 1.2 + i * 0.5) * 0.08;
        const noiseZ = Math.sin(t * 1.1 + i * 0.3) * 0.08;

        // Intense 'Super-Blast' Distortion
        const blastFactor = Math.pow(p, 0.35); // Even more explosive start
        const explosion = shock * (1 - p) * 25; // Much stronger initial kick
        
        const distortion = 1 + explosion;
        posAttr.array[i3] = lerp(positions.pos[i3] + noiseX, positions.targets[i3] * distortion, blastFactor);
        posAttr.array[i3 + 1] = lerp(positions.pos[i3 + 1] + noiseY, positions.targets[i3 + 1] * distortion, blastFactor);
        posAttr.array[i3 + 2] = lerp(positions.pos[i3 + 2] + noiseZ, positions.targets[i3 + 2] * distortion, blastFactor);
    }
    posAttr.needsUpdate = true;

    // Nebula Core Animation
    if (coreRef.current) {
      coreRef.current.rotation.y = -t * 0.5;
      coreRef.current.rotation.z = t * 0.3;
      coreRef.current.scale.setScalar(lerp(1, 0, p)); // Shrinks as black hole opens
    }

    // Rotation & Parallax
    pointsRef.current.rotation.y = t * 0.15 + sceneState.mouse.x * 0.3 * (1 - p);
    pointsRef.current.rotation.x = t * 0.05 + sceneState.mouse.y * 0.2 * (1 - p);
    
    // Scale pulse with cinematic 'Blast' bump
    const blastPulse = shock * 3;
    const scaleFactor = isEnabled ? lerp(1, 14, Math.pow(p, 0.4)) + blastPulse : 0;
    groupRef.current.scale.setScalar(scaleFactor);
  });

  const { gl } = useThree();

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    
    // Allow pointer events as soon as it starts fading in
    const shouldBeInteractive = (isEnabled && opacity > 0.01) || state !== 'IDLE';
    
    // Directly override the gl dom element pointer events (fixes interaction block)
    if (gl.domElement) {
      gl.domElement.style.pointerEvents = shouldBeInteractive ? 'auto' : 'none';
    }

    const canvasContainer = document.getElementById('webgl');
    if (canvasContainer) {
      canvasContainer.style.pointerEvents = shouldBeInteractive ? 'auto' : 'none';
      canvasContainer.style.zIndex = shouldBeInteractive ? '1000' : '1';
    }
  }, [hovered, isEnabled, opacity, state, gl]);

  const groupRef = useRef<THREE.Group>(null);

  // Always render but control visibility via Three.js 'visible' prop
  // This avoids mounting/unmounting issues during fast scrolls
  return (
    <group ref={groupRef} visible={isEnabled && opacity > 0}>
      {/* Invisible Click Target — much easier to hit than individual points */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions.pos}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#C6FF00"
          size={hovered ? 0.065 : 0.045} // Visual feedback on hover
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={opacity}
        />
      </points>

      {/* Nebula Core */}
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2000}
            array={positions.corePos}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#AFFF00"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={opacity * 0.4}
        />
      </points>

      {(state === 'WAITING' || (state === 'EXPANDING' && stateRef.current.progress > 0.5)) && (
        <Html center portal={undefined} calculatePosition={(el, cam, sz) => [0, 0]}>
          <div 
            className="cyber-hud-container"
            style={{
              opacity: state === 'WAITING' ? 1 : (stateRef.current.progress - 0.5) * 2,
              transform: `scale(${lerp(0.8, 1, state === 'WAITING' ? 1 : (stateRef.current.progress - 0.5) * 2)})`,
              pointerEvents: 'auto',
              zIndex: 3000 // Ensure it's above EVERYTHING
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              window.open('https://unstop.com/college-fests/openloop-26-yenepoya-school-of-engineering-and-technology-458231', '_blank')
            }}
          >
            {/* HUD Corner Decor */}
            <div className="hud-corner top-left" />
            <div className="hud-corner top-right" />
            <div className="hud-corner bottom-left" />
            <div className="hud-corner bottom-right" />
            
            <div className="hud-scanline" />
            
            <h2 className="hud-title">JOIN THE LOOP</h2>
            <div className="hud-divider" />
            <p className="hud-subtitle">ACCESS_POINT: GRV_CORE_01</p>
            <p className="hud-hint">TAP TO INITIALIZE UPLOAD</p>
          </div>
        </Html>
      )}
    </group>
  );
};
