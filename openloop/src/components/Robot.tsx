import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment } from '@react-three/drei';
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
  
  // Using a high-quality cinematic model (DamagedHelmet looks very "Cyber-Robotic")
  // Using a CDN hosted GLB for robustness if local is missing
  const { scene, nodes, materials } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb') as any;

  // Refine materials for cinematic look
  useMemo(() => {
    if (materials['Material_MR']) {
      materials['Material_MR'].metalness = 1.0;
      materials['Material_MR'].roughness = 0.15;
      materials['Material_MR'].emissive = new THREE.Color('#00ccff');
      materials['Material_MR'].emissiveIntensity = 0.2;
    }
  }, [materials]);

  useFrame((state) => {
    if (!groupRef.current || phase !== 'main') return;

    // Normalized scroll progress (0 to 1)
    const mainScroll = robotProgressRef.current;

    // Visibility control
    const disappearThreshold = 0.85; // Disappear before themes
    if (mainScroll >= disappearThreshold) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // --- ESYA STYLE SCROLL SYSTEM ---
    
    // 1. Proportional Rotation (Hero -> Section 2 -> Section 3 -> Timeline)
    // hero (0) -> s2 (0.25) -> s3 (0.5) -> timeline (0.75)
    // Let's rotate 270 degrees total (PI * 1.5)
    const targetRotationY = mainScroll * (Math.PI * 1.5);
    
    // Smooth Lerp for Jerk-free movement
    // Added Math.PI offset to face the camera initially
    const baseRotationY = Math.PI;
    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, baseRotationY + targetRotationY + mouseX * 0.1, 0.08);

    // 2. Slight X tilt based on scroll transition
    const tiltX = Math.sin(mainScroll * Math.PI) * 0.15;
    groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, tiltX, 0.05);

    // --- Color Changing (Emissive) ---
    if (materials['Material_MR']) {
      const color1 = new THREE.Color('#00ccff'); // Cyan
      const color2 = new THREE.Color('#ff0066'); // Pink/Red
      const lerpedColor = color1.clone().lerp(color2, mainScroll);
      materials['Material_MR'].emissive.copy(lerpedColor);
      materials['Material_MR'].emissiveIntensity = lerp(0.5, 2.5, Math.sin(mainScroll * Math.PI));
    }

    // 3. Backward movement (z-axis) as we exit
    const exitP = Math.max(0, (mainScroll - 0.7) * 6.6); // 0.7 to 0.85
    groupRef.current.position.z = lerp(0, -5, exitP);
    
    // 4. Opacity/Scale fade
    const scaleFade = lerp(1.5, 0.8, exitP);
    groupRef.current.scale.setScalar(scaleFade);

    // 5. Gentle floating animation
    const float = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    groupRef.current.position.y = float;
  });

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]}>
      <primitive object={scene} rotation={[Math.PI / 2, 0, 0]} />
      {/* Add extra eye glow or light points if needed */}
      <pointLight color="#00ffff" intensity={2} distance={2} position={[0, 0, 0.5]} />
    </group>
  );
};

useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb');

