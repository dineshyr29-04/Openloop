import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Background: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const gridRef = useRef<THREE.Group>(null);
  
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
    if (gridRef.current) {
      // Subtle float for the grid
      gridRef.current.position.y = -5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      <fog attach="fog" args={['#080808', 5, 25]} />
      
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.05} 
          color="#00ccff" 
          transparent 
          opacity={0.3} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending}
        />
      </points>

      <group ref={gridRef} position={[0, -5, 0]}>
        {/* Large Cinematic Grid */}
        <gridHelper args={[100, 50, '#112233', '#050a15']} rotation={[0, 0, 0]} />
        
        {/* Subtle glow layer for grid */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial 
            color="#002244" 
            transparent 
            opacity={0.05} 
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
