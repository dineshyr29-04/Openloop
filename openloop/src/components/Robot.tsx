import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp, normalize, mapRange } from '../utils/math';

interface RobotProps {
  scrollVal: number;
}

export const Robot: React.FC<RobotProps> = ({ scrollVal }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Geometries and materials optimization
  const materials = useMemo(() => ({
    skull: new THREE.MeshStandardMaterial({ color: '#0d0d1a', metalness: 0.95, roughness: 0.08, transparent: true, opacity: 1 }),
    plate: new THREE.MeshStandardMaterial({ color: '#141428', metalness: 0.9, roughness: 0.12, transparent: true, opacity: 1 }),
    jaw: new THREE.MeshStandardMaterial({ color: '#080812', metalness: 0.98, roughness: 0.05, transparent: true, opacity: 1 }),
    eyeGlow: new THREE.MeshBasicMaterial({ color: '#00f0ff', transparent: true, opacity: 0.92 }),
    seam: new THREE.MeshBasicMaterial({ color: '#00f0ff', transparent: true, opacity: 0.6 }),
    ring: new THREE.MeshStandardMaterial({ color: '#00ccff', emissive: '#00ccff', emissiveIntensity: 0.5, wireframe: true, transparent: true, opacity: 0.12 }),
    ringSolid: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.12 })
  }), []);

  const geos = useMemo(() => ({
    head: new THREE.SphereGeometry(1.2, 32, 32),
    face: new THREE.PlaneGeometry(1.6, 0.8),
    eye: new THREE.PlaneGeometry(0.3, 0.1),
    ringOuter: new THREE.TorusGeometry(2, 0.05, 16, 50),
    ringInner: new THREE.TorusGeometry(1.5, 0.02, 16, 40)
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Visibility mapping
    const appearProg = normalize(scrollVal, 0, 0.15); // Fade in immediately
    const rotationProg = normalize(scrollVal, 0.2, 0.6); // Main rotation mapping
    const exitProg = normalize(scrollVal, 0.75, 0.8); // Exit mapping

    // Only render if visible
    if (scrollVal >= 0.85) {
      groupRef.current.visible = false;
      return;
    } else {
      groupRef.current.visible = true;
    }

    // Appearance logic
    const baseOpacity = lerp(0.65, 1, Math.min(1, appearProg * 2)); // Always visible at intro
    
    // Extinction logic (0.75 -> 0.8)
    const finalOpacity = lerp(baseOpacity, 0, exitProg);
    const targetZ = lerp(0, -10, exitProg); // slide back
    const targetScale = lerp(1, 0.5, exitProg);

    // Update Materials opacity
    Object.values(materials).forEach((mat) => {
      mat.opacity = finalOpacity * (mat === materials.ring || mat === materials.ringSolid ? 0.12 : 1);
      mat.needsUpdate = true;
    });

    // Rotation based on scroll (0.2 -> 0.6)
    // Map scroll to rotation: rotationY = scrollMapped * (Math.PI * 1.5)
    // Section mapping: 0.2 -> 0°, 0.3 -> 90°, 0.4 -> 180°, 0.5 -> 270°
    // The exact request formula:
    
    // We want scroll 0.2 -> 0.53 to equal 270 (1.5 PI)
    // So 0.2=0, 0.3=0.5PI, 0.4=1PI, 0.5=1.5PI... Wait, if 0.2-0.6 mapped to max. Let's map directly:
    // Scroll distance = 0.6 - 0.2 = 0.4
    // 0.2 -> 0, 0.6 -> pi*1.5 
    const targetRotY = mapRange(rotationProg, 0, 1, 0, Math.PI * 1.5);
    
    // Subtle X-axis tilt
    const targetRotX = Math.sin(rotationProg * Math.PI) * 0.2;

    // Lerp transformations
    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetRotY - 0.26, 0.08);
    groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, targetRotX, 0.08);

    // Apply Z exit position
    groupRef.current.position.z = lerp(groupRef.current.position.z, targetZ, 0.08);
    groupRef.current.scale.setScalar(lerp(groupRef.current.scale.x, targetScale, 0.08));

    // Idle floating animation overlaid
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <group ref={groupRef} position={[-0.3, -0.1, 0]} scale={[1.4, 1.4, 1.4]}>
      {/* Head */}
      <mesh geometry={geos.head} material={materials.skull} />
      
      {/* Face Plate */}
      <mesh geometry={geos.face} material={materials.plate} position={[0, 0.1, 1.15]} rotation={[0, 0, 0]} />
      <mesh geometry={geos.face} material={materials.jaw} position={[0, -0.45, 1.07]} rotation={[-0.18, 0, 0]} scale={[0.9, 0.45, 1]} />
      
      {/* Eyes */}
      <mesh geometry={geos.eye} material={materials.eyeGlow} position={[-0.4, 0.1, 1.16]} />
      <mesh geometry={geos.eye} material={materials.eyeGlow} position={[0.4, 0.1, 1.16]} />
      <mesh geometry={geos.eye} material={materials.seam} position={[0, -0.15, 1.16]} scale={[4, 0.35, 1]} />

      {/* Orbiting Rings */}
      <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <mesh geometry={geos.ringOuter} material={materials.ring} />
        <mesh geometry={geos.ringInner} material={materials.ringSolid} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  );
};
