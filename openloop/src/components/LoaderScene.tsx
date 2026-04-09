import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { lerp } from '../utils/math';

interface LoaderSceneProps {
  progress: number;
  phase: 'loader' | 'intro' | 'main';
}

export const LoaderScene: React.FC<LoaderSceneProps> = ({ progress, phase }) => {
  const laptopGroupRef = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);
  const screenMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const textMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const portalRef = useRef<THREE.Group>(null);
  
  const [introStartTime, setIntroStartTime] = useState<number | null>(null);

  const materials = useMemo(() => ({
    casing: new THREE.MeshStandardMaterial({
      color: '#121212',
      metalness: 0.9,
      roughness: 0.2,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0.4,
      roughness: 0.3,
      emissive: '#00ccff',
      emissiveIntensity: 0,
    }),
    text: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 0,
    }),
    portal: new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0,
    }),
  }), []);

  const geos = useMemo(() => ({
    base: new THREE.BoxGeometry(2.5, 0.1, 1.8),
    lid: new THREE.BoxGeometry(2.5, 1.7, 0.08),
    screen: new THREE.PlaneGeometry(2.35, 1.55),
    portal: new THREE.CircleGeometry(0.2, 64),
  }), []);

  useFrame((state, delta) => {
    if (!laptopGroupRef.current || !hingeRef.current) return;

    // --- LOADER PHASE ---
    if (phase === 'loader') {
      // Laptop scales in and rotates from side
      const scale = Math.min(1, progress * 1.5);
      laptopGroupRef.current.scale.setScalar(lerp(0, 1, Math.pow(scale, 2)));
      
      // Rotate from 45 degrees side to front
      laptopGroupRef.current.rotation.y = lerp(-Math.PI / 4, 0, progress);
      laptopGroupRef.current.position.z = lerp(-2, 0, progress);
      laptopGroupRef.current.position.y = -0.5;
    }

    // --- INTRO PHASE ---
    if (phase === 'intro') {
      if (introStartTime === null) setIntroStartTime(state.clock.elapsedTime);
      const elapsed = state.clock.elapsedTime - (introStartTime || state.clock.elapsedTime);
      const introProgress = Math.min(elapsed / 3.0, 1); // 3s intro

      // 1. Hinge opens (rotation on X)
      // Range: 0 (closed) to Math.PI * 0.6 (opened ~110 deg)
      hingeRef.current.rotation.x = lerp(0, Math.PI * 0.6, Math.min(introProgress * 2, 1));

      // 2. Screen emissive ramp up
      if (screenMaterialRef.current) {
        screenMaterialRef.current.emissiveIntensity = lerp(0, 1.2, Math.max(0, (introProgress - 0.4) * 2));
      }
      if (textMaterialRef.current) {
        textMaterialRef.current.emissiveIntensity = lerp(0, 5, Math.max(0, (introProgress - 0.5) * 2));
      }

      // 3. Portal appears on the second 'o'
      // "openloop" -> indices: o(0) p(1) e(2) n(3) l(4) o(5) o(6) p(7)
      // Second 'o' is at index 5 or 6? Let's aim for the 'o' in 'loop' (index 6)
      if (portalRef.current) {
        const portalP = Math.max(0, (introProgress - 0.7) * 3.3); // Starts at 0.7, ends at 1.0
        portalRef.current.scale.setScalar(lerp(0, 50, Math.pow(portalP, 3)));
        materials.portal.opacity = lerp(0, 1, portalP);
      }

      // 4. Camera Zoom into portal
      if (introProgress > 0.8) {
        const zoomP = (introProgress - 0.8) * 5;
        state.camera.position.z = lerp(3.8, 0.1, Math.pow(zoomP, 2));
      }
    }

    // Subtle breathing/idle
    const bounce = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    laptopGroupRef.current.position.y = -0.5 + bounce;
  });

  return (
    <group>
      <group ref={laptopGroupRef}>
        <mesh geometry={geos.base} material={materials.casing} position={[0, 0, 0]} />
        
        {/* Hinge point at the back of the base */}
        <group ref={hingeRef} position={[0, 0.05, -0.9]}>
          <group position={[0, 0.85, 0]}> {/* Offset pivot center */}
            <mesh geometry={geos.lid} material={materials.casing} />
            <mesh 
              geometry={geos.screen} 
              position={[0, 0, 0.05]} 
              rotation={[0, 0, 0]}
            >
              <meshStandardMaterial ref={screenMaterialRef} {...materials.screen} />
            </mesh>
            
            {/* Engraved Text */}
            <group position={[0, 0, 0.06]}>
              <Text
                font="https://fonts.gstatic.com/s/audiowide/v16/l7AU6Wp5mXCyd_89ov-9fWf0Xw.woff"
                fontSize={0.25}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                openloop
                <meshStandardMaterial ref={textMaterialRef} {...materials.text} />
              </Text>
              
              {/* Portal positioned specifically over the second 'o' */}
              {/* Manual adjustment for position over 'o' in loop */}
              <group ref={portalRef} position={[0.27, 0, 0.01]} scale={[0, 0, 0]}>
                <mesh geometry={geos.portal} material={materials.portal} />
              </group>
            </group>
          </group>
        </group>
      </group>
      
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 2, 2]} intensity={1} />
    </group>
  );
};

