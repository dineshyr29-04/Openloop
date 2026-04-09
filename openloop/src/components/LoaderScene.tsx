import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera, Environment } from '@react-three/drei';
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
  
  const introTimerRef = useRef<number | null>(null);

  const materials = useMemo(() => ({
    casing: new THREE.MeshStandardMaterial({
      color: '#2a2a2a',
      metalness: 1.0,
      roughness: 0.15,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0.4,
      roughness: 0.1,
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
    // Reduced base and screen dimensions slightly for refined look
    base: new THREE.BoxGeometry(2.2, 0.08, 1.6),
    lid: new THREE.BoxGeometry(2.2, 1.5, 0.06),
    screen: new THREE.PlaneGeometry(2.05, 1.35),
    portal: new THREE.CircleGeometry(0.2, 64),
    // Progress bar geometry
    progressBg: new THREE.PlaneGeometry(1.2, 0.05),
    progressBar: new THREE.PlaneGeometry(1.2, 0.05),
  }), []);

  useFrame((state) => {
    if (!laptopGroupRef.current || !hingeRef.current) return;

    // --- LOADER PHASE ---
    if (phase === 'loader') {
      // Start at 0.5 scale instead of 0 to avoid initial black screen
      const scaleBase = 0.4;
      laptopGroupRef.current.scale.setScalar(lerp(scaleBase, 4.2, Math.pow(progress, 1.5)));
      laptopGroupRef.current.rotation.y = lerp(-Math.PI / 8, 0, progress);
      laptopGroupRef.current.position.z = lerp(-3, 0, progress);
      laptopGroupRef.current.position.y = -1.0;
    }

    // --- INTRO PHASE ---
    if (phase === 'intro') {
      if (introTimerRef.current === null) introTimerRef.current = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - introTimerRef.current;
      const introDuration = 4.0; 
      const introProgress = Math.min(elapsed / introDuration, 1); 

      // 1. Hinge opens
      hingeRef.current.rotation.x = lerp(0, Math.PI * 0.65, Math.min(introProgress * 1.8, 1));

      // 2. Screen emissive
      if (screenMaterialRef.current) {
        screenMaterialRef.current.emissiveIntensity = lerp(0.5, 4.5, Math.max(0, (introProgress - 0.2) * 2));
      }
      if (textMaterialRef.current) {
        textMaterialRef.current.emissiveIntensity = lerp(0, 20, Math.max(0, (introProgress - 0.3) * 2));
      }

      // 3. Portal zoom
      if (portalRef.current) {
        const portalP = Math.max(0, (introProgress - 0.6) * 2.5); 
        portalRef.current.scale.setScalar(lerp(0, 140, Math.pow(portalP, 3.5)));
        materials.portal.opacity = lerp(0, 1, Math.min(portalP * 2, 1));
      }

      // 4. Camera Zoom
      if (introProgress > 0.75) {
        const zoomP = (introProgress - 0.75) * 4;
        state.camera.position.z = lerp(6.0, -2.5, Math.pow(zoomP, 3));
      }
    }

    const bounce = Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
    laptopGroupRef.current.position.y = -1.0 + bounce;
  });

  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 0, 6.0]} />
      <Environment preset="city" />
      
      <group ref={laptopGroupRef}>
        <mesh geometry={geos.base} material={materials.casing} position={[0, 0, 0]} />
        
        <group ref={hingeRef} position={[0, 0.04, -0.8]}>
          <group position={[0, 0.75, 0]}>
            <mesh geometry={geos.lid} material={materials.casing} />
            <mesh 
              geometry={geos.screen} 
              position={[0, 0, 0.04]} 
              rotation={[0, 0, 0]}
            >
              <meshStandardMaterial ref={screenMaterialRef} {...materials.screen} />
            </mesh>
            
            <group position={[0, 0, 0.05]}>
              <Text
                fontSize={0.22}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
                textAlign="center"
                // Using a more reliable font link or system font fallback if failed
                font="https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/audiowide/Audiowide-Regular.ttf"
                letterSpacing={0.15}
              >
                OPENLOOP
                <meshStandardMaterial ref={textMaterialRef} {...materials.text} />
              </Text>

              {/* Interactive Loading Bar */}
              <group position={[0, -0.3, 0.01]}>
                <mesh geometry={geos.progressBg}>
                  <meshBasicMaterial color="#111111" />
                </mesh>
                <mesh 
                  geometry={geos.progressBar} 
                  scale={[progress, 1, 1]}
                  position={[-(1 - progress) * 0.6, 0, 0.01]}
                >
                  <meshBasicMaterial color="#00f0ff" />
                </mesh>
              </group>
              
              <group ref={portalRef} position={[0.27, 0, 0.01]} scale={[0, 0, 0]}>
                <mesh geometry={geos.portal} material={materials.portal} />
              </group>
            </group>
          </group>
        </group>
      </group>
      
      <ambientLight intensity={2.0} />
      <pointLight position={[5, 10, 5]} intensity={8} />
      <pointLight position={[-5, 5, 5]} intensity={5} color="#00f0ff" />
      <pointLight position={[0, 2, 2]} intensity={4} color="#ffffff" />
    </group>
  );
};

