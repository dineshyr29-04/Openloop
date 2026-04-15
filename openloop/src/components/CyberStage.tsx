import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp } from '../utils/math';

interface CyberStageProps {
  scrollVal: number;
}

const nebulaFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    
    // Cosmic Nebula Logic (Procedural)
    float n = 0.0;
    vec2 p2 = p;
    for(float i=1.0; i<4.0; i++) {
      p2 += vec2(sin(uTime * 0.1 * i + p2.y * 2.0), cos(uTime * 0.15 * i + p2.x * 2.0));
      n += 0.5 / length(p2);
    }
    
    n = pow(n * 0.15, 2.5);
    
    // Silver/White/Deep Grey base
    vec3 color = mix(vec3(0.02, 0.02, 0.05), vec3(0.8, 0.8, 1.0), n);
    
    // Add a hint of deep purple for depth
    color += vec3(0.05, 0.0, 0.1) * (1.0 - length(p));
    
    gl_FragColor = vec4(color, uOpacity * 0.8);
  }
`;

const nebulaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const CyberStage: React.FC<CyberStageProps> = ({ scrollVal }) => {
  const gridRef = useRef<THREE.Mesh>(null);
  const nebulaRef = useRef<THREE.Mesh>(null);
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const isVisible = scrollVal >= 0.95;
  const opacity = clamp((scrollVal - 0.95) / 0.03, 0, 1);

  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#ffffff'; // Silver/White Grid
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);

  useFrame((state) => {
    if (!isVisible) return;
    const t = state.clock.elapsedTime;
    
    if (nebulaMaterialRef.current) {
      nebulaMaterialRef.current.uniforms.uTime.value = t;
      nebulaMaterialRef.current.uniforms.uOpacity.value = opacity;
    }

    if (gridRef.current) {
      gridRef.current.material.opacity = opacity * 0.5;
      // Perspective movement
      const mat = gridRef.current.material as THREE.MeshStandardMaterial;
      if (mat.map) mat.map.offset.y = -t * 0.05;
    }
  });

  return (
    <group visible={isVisible}>
      {/* 1. Nebula Background Glow */}
      <mesh ref={nebulaRef} position={[0, 0, -10]}>
        <planeGeometry args={[100, 100]} />
        <shaderMaterial
          ref={nebulaMaterialRef}
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uOpacity: { value: 0 }
          }}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* 2. Silver/White Grid Floor */}
      <mesh 
        ref={gridRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2.5, -15]}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          map={gridTexture} 
          transparent 
          opacity={0} 
          emissive="#ffffff"
          emissiveIntensity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <fog attach="fog" args={['#000', 10, 40]} />
    </group>
  );
};
