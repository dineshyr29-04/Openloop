import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { lerp, clamp } from '../utils/math';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
  
  // Use a simple any cast for now to verify if the syntax error disappears
  const { scene, materials } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb') as any;

  const stateRef = useRef({
    posX: 0,
    posY: -2,
    rotY: 0,
    rotX: 0,
    scale: 0.8,
    opacity: 0,
    greenIntensity: 0,
  });

  useMemo(() => {
    const material = materials['Material_MR'];
    if (material) {
      material.metalness = 1.0;
      material.roughness = 0.15;
      material.emissive = new THREE.Color('#C6FF00');
      material.emissiveIntensity = 0;
      material.transparent = true;
    }
  }, [materials]);

  useFrame((state) => {
    if (!groupRef.current || phase !== 'main') return;

    const p = robotProgressRef.current;
    
    // Continuous Target State
    let targetX = 0;
    let targetY = 0; // VERTICAL CENTERING FIX
    let targetRotY = 0;
    let targetRotX = 0;
    let targetScale = 2.0;
    let targetOpacity = 1;
    let targetGreen = 0.8;

    // Phase 1: Stabilization (0.0 -> 0.08) - Rapid entry
    if (p < 0.08) {
      const entryP = clamp(p / 0.08, 0, 1);
      targetY = lerp(-2.5, 0, easeOut(entryP));
      targetScale = lerp(1.2, 2.2, easeOut(entryP));
      targetOpacity = entryP;
      targetGreen = lerp(0, 1.2, entryP);
    } 
    // Phase 2: Hero -> Timeline transition (0.08 -> 0.45)
    else if (p < 0.45) {
      // Localized movement for Timeline window
      const timelineP = clamp((p - 0.20) / 0.25, 0, 1);
      targetX = lerp(0, -2.4, easeInOut(timelineP));
      targetRotY = lerp(0, Math.PI / 2.2, easeInOut(timelineP));
      targetGreen = lerp(1.2, 4, timelineP);
      targetScale = 2.0;
    } 
    // Phase 3: Timeline -> Themes transition (0.45 -> 0.70)
    else if (p < 0.70) {
      const themeP = clamp((p - 0.45) / 0.25, 0, 1);
      targetX = lerp(-2.4, 2.4, easeInOut(themeP));
      targetRotY = lerp(Math.PI / 2.2, -Math.PI / 2.2, easeInOut(themeP));
      targetGreen = lerp(4, 3, themeP);
      targetScale = 2.0;
      targetOpacity = 1;
    } 
    // Phase 4: Final State & Exit (0.70 -> 1.0)
    else {
      const finalP = clamp((p - 0.70) / 0.15, 0, 1);
      targetX = lerp(2.4, 8, easeIn(finalP)); // Fly out
      targetRotY = lerp(-Math.PI / 2.2, -Math.PI / 1.1, finalP);
      targetOpacity = lerp(1, 0, finalP);
      targetScale = lerp(2.0, 1.4, finalP);
      targetGreen = lerp(3, 0, finalP);
    }

    // Add mouse parallax on top of scroll targets
    targetX += mouseX * 0.5;
    targetRotY += mouseX * 0.25;
    targetRotX += (state.mouse.y * -0.2);

    const factor = 0.08;
    stateRef.current.posX += (targetX - stateRef.current.posX) * factor;
    stateRef.current.posY += (targetY - stateRef.current.posY) * factor;
    stateRef.current.rotY += (targetRotY - stateRef.current.rotY) * factor;
    stateRef.current.rotX += (targetRotX - stateRef.current.rotX) * factor;
    stateRef.current.scale += (targetScale - stateRef.current.scale) * factor;
    stateRef.current.opacity += (targetOpacity - stateRef.current.opacity) * factor;
    stateRef.current.greenIntensity += (targetGreen - stateRef.current.greenIntensity) * factor;

    groupRef.current.position.x = stateRef.current.posX;
    groupRef.current.position.y = stateRef.current.posY + Math.sin(state.clock.elapsedTime * 1.5) * 0.06; // Continuous levitation
    groupRef.current.rotation.y = stateRef.current.rotY;
    groupRef.current.rotation.x = stateRef.current.rotX;
    groupRef.current.scale.setScalar(stateRef.current.scale);
    groupRef.current.visible = stateRef.current.opacity > 0.01;

    const material = materials['Material_MR'];
    if (material) {
      material.emissiveIntensity = stateRef.current.greenIntensity * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.15);
      material.opacity = stateRef.current.opacity;
    }

    if (headLightRef.current) {
      headLightRef.current.intensity = stateRef.current.greenIntensity * 4;
      headLightRef.current.position.x = p < 0.45 ? 1.5 : -1.5;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      <pointLight 
        ref={headLightRef} 
        color="#C6FF00" 
        intensity={0} 
        distance={6} 
        position={[0, 0, 1.5]} 
      />
    </group>
  );
};

useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb');
