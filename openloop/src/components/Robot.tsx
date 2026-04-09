import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

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
  const headLightRef = useRef<THREE.PointLight>(null);
  
  const { scene, materials } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb') as any;

  // Refs for smooth lerp state
  const stateRef = useRef({
    posX: 0,
    rotY: 0,
    scale: 1.8,
    opacity: 1,
    greenIntensity: 0,
  });

  useMemo(() => {
    if (materials['Material_MR']) {
      materials['Material_MR'].metalness = 1.0;
      materials['Material_MR'].roughness = 0.15;
      materials['Material_MR'].emissive = new THREE.Color('#00ffbb'); // Green base
      materials['Material_MR'].emissiveIntensity = 0;
    }
  }, [materials]);

  useFrame((state) => {
    if (!groupRef.current || phase !== 'main') return;

    const p = robotProgressRef.current;
    
    // Target state determination
    let targetX = 0;
    let targetRotY = 0;
    let targetScale = 1.8;
    let targetProgress = 1;
    let targetGreen = 0;

    if (p < 0.2) {
      // 0. Hero Phase
      targetX = 0;
      targetRotY = 0;
      targetGreen = 0.5;
    } else if (p < 0.45) {
      // 1. Section 1 (About) - Profile Left, Robot Left
      targetX = -1.8;
      targetRotY = Math.PI / 2;
      targetGreen = 4;
    } else if (p < 0.7) {
      // 2. Section 2 (Features) - Profile Right, Robot Right
      targetX = 1.8;
      targetRotY = -Math.PI / 2;
      targetGreen = 2.5;
    } else {
      // 3. Exit Phase (Before Timeline)
      const exitP = Math.min(1, (p - 0.7) * 5);
      targetX = 1.8 + exitP * 10;
      targetRotY = -Math.PI / 1.5;
      targetProgress = 1 - exitP;
      targetScale = 1.8 * (1 - exitP * 0.5);
      targetGreen = 2 * (1 - exitP);
    }

    // Strict Lerp Implementation (0.08 factor)
    stateRef.current.posX += (targetX - stateRef.current.posX) * 0.08;
    stateRef.current.rotY += (targetRotY - stateRef.current.rotY) * 0.08;
    stateRef.current.scale += (targetScale - stateRef.current.scale) * 0.08;
    stateRef.current.opacity += (targetProgress - stateRef.current.opacity) * 0.08;
    stateRef.current.greenIntensity += (targetGreen - stateRef.current.greenIntensity) * 0.08;

    groupRef.current.position.x = stateRef.current.posX;
    groupRef.current.rotation.y = stateRef.current.rotY + mouseX * 0.1;
    groupRef.current.scale.setScalar(stateRef.current.scale);
    groupRef.current.visible = stateRef.current.opacity > 0.01;

    // Pulse effect
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
    
    if (materials['Material_MR']) {
      materials['Material_MR'].emissiveIntensity = stateRef.current.greenIntensity * pulse;
      materials['Material_MR'].opacity = stateRef.current.opacity;
      materials['Material_MR'].transparent = true;
    }

    if (headLightRef.current) {
      headLightRef.current.intensity = stateRef.current.greenIntensity * 2 * pulse;
      // Position light to emit toward the content side
      headLightRef.current.position.x = p < 0.45 ? 1 : -1;
    }

    // Gentle float
    groupRef.current.position.y = -0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <group ref={groupRef} scale={[1.8, 1.8, 1.8]} position={[0, -0.6, 0]}>
      <primitive object={scene} rotation={[0, 0, 0]} />
      {/* Dynamic Emissive Source */}
      <pointLight 
        ref={headLightRef} 
        color="#00ffbb" 
        intensity={0} 
        distance={5} 
        position={[0, 0, 1]} 
      />
    </group>
  );
};

useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb');

