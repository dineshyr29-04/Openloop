import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp } from '../utils/math';

interface RobotProps {
  scrollVal: number;
  robotProgressRef: React.MutableRefObject<number>;
  themeProgressRef: React.MutableRefObject<number>;
  mouseX: number;
  phase: string;
}

export const Robot: React.FC<RobotProps> = ({
  scrollVal: _scrollVal,
  robotProgressRef,
  themeProgressRef: _themeProgressRef,
  mouseX,
  phase,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Better materials for more realistic human-like face
  const materials = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({
      color: '#d4a574', // Better skin tone
      metalness: 0.15,
      roughness: 0.6,
      emissive: '#1a0f0a',
    }),
    metal: new THREE.MeshStandardMaterial({
      color: '#2a2a2a',
      metalness: 0.95,
      roughness: 0.1,
    }),
    eyeSclera: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.1,
      roughness: 0.3,
    }),
    eyeIris: new THREE.MeshStandardMaterial({
      color: '#2c1810',
      metalness: 0.3,
      roughness: 0.2,
      emissive: '#00ff00',
      emissiveIntensity: 0.8,
    }),
    eyeGlow: new THREE.MeshBasicMaterial({
      color: '#00ff00',
      transparent: true,
      opacity: 0.9,
    }),
  }), []);

  // Improved geometries for better human likeness
  const geos = useMemo(() => ({
    head: new THREE.IcosahedronGeometry(1, 5), // Better subdivision for smoother face
    jaw: new THREE.BoxGeometry(0.8, 0.35, 0.6),
    cheekL: new THREE.BoxGeometry(0.4, 0.5, 0.5),
    cheekR: new THREE.BoxGeometry(0.4, 0.5, 0.5),
    nose: new THREE.ConeGeometry(0.15, 0.4, 8),
    eyeSclera: new THREE.SphereGeometry(0.25, 16, 16),
    eyeIris: new THREE.SphereGeometry(0.16, 16, 16),
    eyeGlow: new THREE.SphereGeometry(0.27, 8, 8),
    mouth: new THREE.BoxGeometry(0.4, 0.08, 0.05),
  }), []);

  useFrame((state) => {
    if (!groupRef.current || phase !== 'main') return;

    // Normalized scroll progress for main content
    const mainScroll = robotProgressRef.current;

    // Robot visibility: disappear before timeline (at ~0.72 progress)
    const disappearThreshold = 0.72;
    if (mainScroll >= disappearThreshold) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;

    // Simple proportional rotation mapping
    // rotationY goes from 0 to 2π * 0.75 (270 degrees)
    const maxRotation = Math.PI * 2 * 0.75;
    const targetRotation = mainScroll * maxRotation;

    // Smooth interpolation for jerky motion fix
    const smoothFactor = 0.08;
    groupRef.current.rotation.y +=
      (targetRotation + mouseX * 0.08 - groupRef.current.rotation.y) * smoothFactor;

    // Gentle bobbing motion
    const bobAmount = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    groupRef.current.position.y = bobAmount;

    // Fade out as we approach timeline
    const fadeStart = 0.65;
    const fadeOut = Math.max(0, Math.min(1, (mainScroll - fadeStart) / (disappearThreshold - fadeStart)));
    
    // Update material opacities
    materials.eyeGlow.opacity = 0.9 * (1 - fadeOut);

    // Eye color transitions based on scroll progress
    const eyeColors = [
      new THREE.Color('#00ff00'), // Green at start
      new THREE.Color('#00ccff'), // Cyan mid
      new THREE.Color('#ff9900'), // Orange near end
    ];
    
    const colorIndex = Math.floor(mainScroll * 2);
    const colorT = (mainScroll * 2) % 1;
    const fromColor = eyeColors[Math.min(colorIndex, eyeColors.length - 1)];
    const toColor = eyeColors[Math.min(colorIndex + 1, eyeColors.length - 1)];
    
    const currentColor = fromColor.clone().lerp(toColor, colorT);
    materials.eyeGlow.color.copy(currentColor);
    materials.eyeIris.emissive.copy(currentColor);

    // Breathing animation
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    groupRef.current.scale.setScalar(lerp(groupRef.current.scale.x, breathe, 0.05));
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Main head structure */}
      <mesh ref={headRef} geometry={geos.head} material={materials.skin} castShadow receiveShadow />

      {/* Jaw */}
      <mesh geometry={geos.jaw} material={materials.skin} position={[0, -0.55, 0.2]} />

      {/* Cheeks for facial structure */}
      <mesh geometry={geos.cheekL} material={materials.skin} position={[-0.55, 0, 0.15]} />
      <mesh geometry={geos.cheekR} material={materials.skin} position={[0.55, 0, 0.15]} />

      {/* Nose */}
      <mesh geometry={geos.nose} material={materials.skin} position={[0, 0.1, 0.8]} rotation={[Math.PI, 0, 0]} />

      {/* Left Eye */}
      <group position={[-0.35, 0.25, 0.85]}>
        {/* Sclera */}
        <mesh geometry={geos.eyeSclera} material={materials.eyeSclera} />
        {/* Iris */}
        <mesh ref={leftEyeRef} geometry={geos.eyeIris} material={materials.eyeIris} position={[0, 0, 0.15]} />
        {/* Glow effect */}
        <mesh geometry={geos.eyeGlow} material={materials.eyeGlow} position={[0, 0, 0.2]} />
      </group>

      {/* Right Eye */}
      <group position={[0.35, 0.25, 0.85]}>
        {/* Sclera */}
        <mesh geometry={geos.eyeSclera} material={materials.eyeSclera} />
        {/* Iris */}
        <mesh ref={rightEyeRef} geometry={geos.eyeIris} material={materials.eyeIris} position={[0, 0, 0.15]} />
        {/* Glow effect */}
        <mesh geometry={geos.eyeGlow} material={materials.eyeGlow} position={[0, 0, 0.2]} />
      </group>

      {/* Mouth */}
      <mesh geometry={geos.mouth} material={materials.metal} position={[0, -0.3, 0.75]} />

      {/* Accent lighting point */}
      <pointLight color="#00ff00" intensity={1.5} distance={3} position={[0, 0.5, 1.2]} />
    </group>
  );
};
