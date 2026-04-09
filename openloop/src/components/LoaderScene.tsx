import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp } from '../utils/math';

interface LoaderSceneProps {
  progress: number; // 0 to 1, time-based
}

export const LoaderScene: React.FC<LoaderSceneProps> = ({ progress }) => {
  const laptopGroupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const portalRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => ({
    casing: new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.85,
      roughness: 0.15,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: '#000011',
      metalness: 0.3,
      roughness: 0.4,
      emissive: '#001133',
      emissiveIntensity: 0,
    }),
    text: new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0,
    }),
    portal: new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0,
      wireframe: false,
    }),
  }), []);

  const geos = useMemo(() => ({
    base: new THREE.BoxGeometry(2.4, 0.12, 1.8),
    screen: new THREE.PlaneGeometry(2.2, 1.4),
    portal: new THREE.CircleGeometry(1.5, 64),
  }), []);

  useFrame((state) => {
    if (!laptopGroupRef.current) return;

    // Phase 1: 0-0.25 - Laptop appears and scales in
    if (progress < 0.25) {
      const p = progress / 0.25;
      const scale = p * p * (3 - 2 * p); // smoothstep easing
      laptopGroupRef.current.scale.setScalar(scale);
      laptopGroupRef.current.position.z = lerp(-2.5, 0, p);
      laptopGroupRef.current.rotation.x = 0;
    }
    // Phase 2: 0.25-0.35 - Rotate to front view (along X axis)
    else if (progress < 0.35) {
      const p = (progress - 0.25) / 0.1;
      laptopGroupRef.current.scale.setScalar(1);
      laptopGroupRef.current.rotation.x = lerp(0, -Math.PI / 2.5, p);
    }
    // Phase 3: 0.35-0.55 - Screen opens (screen component rotates)
    else if (progress < 0.55) {
      const p = (progress - 0.35) / 0.2;
      laptopGroupRef.current.rotation.x = -Math.PI / 2.5;
      if (screenRef.current) {
        screenRef.current.rotation.x = lerp(-0.08, Math.PI / 2.2, p);
      }
    }
    // Phase 4: 0.55-0.75 - Screen lights up
    else if (progress < 0.75) {
      const p = (progress - 0.55) / 0.2;
      if (screenRef.current) {
        screenRef.current.rotation.x = Math.PI / 2.2;
      }
      materials.screen.emissiveIntensity = p * 2;
      if (textRef.current && textRef.current.material && !Array.isArray(textRef.current.material)) {
        (textRef.current.material as THREE.Material & { opacity?: number }).opacity = p * 0.9;
      }
    }
    // Phase 5: 0.75-0.9 - Portal appears and grows from screen center
    else if (progress < 0.9) {
      const p = (progress - 0.75) / 0.15;
      if (portalRef.current) {
        // Portal grows exponentially
        portalRef.current.scale.setScalar(p * p * 8);
        materials.portal.opacity = lerp(0.9, 0.3, p);
      }
    }
    // Phase 6: 0.9-1.0 - Camera moves into portal, laptop fades out
    else {
      const p = (progress - 0.9) / 0.1;
      state.camera.position.z = lerp(3.8, 0, p * p);
      if (laptopGroupRef.current) {
        laptopGroupRef.current.visible = false;
      }
      if (portalRef.current) {
        portalRef.current.visible = false;
      }
    }

    // Subtle idle animation
    const pulse = Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    laptopGroupRef.current.position.y = pulse * (1 - Math.max(0, progress - 0.5));
  });

  return (
    <group>
      {/* Laptop group */}
      <group ref={laptopGroupRef} position={[0, -0.5, -2.5]}>
        {/* Base */}
        <mesh geometry={geos.base} material={materials.casing} position={[0, 0, 0]} />

        {/* Back panel */}
        <mesh
          geometry={new THREE.BoxGeometry(2.4, 1.5, 0.1)}
          material={materials.casing}
          position={[0, 0.9, 0.05]}
        />

        {/* Screen container (hinged group) */}
        <group position={[0, 0.5, 0.5]} rotation={[-0.08, 0, 0]}>
          <mesh
            ref={screenRef}
            geometry={geos.screen}
            material={materials.screen}
            position={[0, 0, 0]}
            rotation={[-0.08, 0, 0]}
          />

          {/* Screen text - OPENLOOP */}
          <mesh
            ref={textRef}
            position={[0, 0, 0.1]}
            scale={[0.001, 0.001, 1]}
          >
            <planeGeometry args={[1400, 400]} />
            <primitive object={materials.text} attach="material" />
          </mesh>
        </group>
      </group>

      {/* Portal effect */}
      <group ref={portalRef} position={[0, 0.3, 0]}>
        <mesh geometry={geos.portal} material={materials.portal} position={[0, 0, 0]} />
        {/* Portal glow ring */}
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  Array.from({ length: 129 }).flatMap((_, i) => {
                    const angle = (i / 128) * Math.PI * 2;
                    return [Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0.05];
                  })
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00f0ff" />
        </mesh>
      </group>
    </group>
  );
};
