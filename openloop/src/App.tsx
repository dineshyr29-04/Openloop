import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollProgress } from './hooks/useScrollProgress';

// Components
import { LoaderScene } from './components/LoaderScene';
import { HeroScene } from './components/HeroScene';
import { Background } from './components/Background';
import { HeroOverlay } from './components/HeroOverlay';
import { TimelineSection } from './components/TimelineSection';
import { ThemesSection } from './components/ThemesSection';
import { FooterSection } from './components/FooterSection';
import { useMousePosition } from './hooks/useMousePosition';
import { lerp } from './utils/math';

import './App.css';

const CameraRig = () => {
  const mouse = useMousePosition();
  
  useFrame((state) => {
    // Parallax logic
    state.camera.position.x = lerp(state.camera.position.x, mouse.x * 0.5, 0.05);
    state.camera.position.y = lerp(state.camera.position.y, mouse.y * 0.5, 0.05);
    state.camera.lookAt(0, 0, 0); // Strict focal point
  });
  return null;
};

const SceneLights = () => {
  const eyeLeftRef = useRef<THREE.PointLight>(null);
  const eyeRightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const pulse = Math.sin(state.clock.elapsedTime * 1.8) * 0.8 + 3.2;
    if (eyeLeftRef.current) {
      eyeLeftRef.current.intensity = pulse;
    }
    if (eyeRightRef.current) {
      eyeRightRef.current.intensity = pulse;
    }
  });

  return (
    <>
      <directionalLight color="#ffffff" intensity={3.5} position={[0, 2, -4]} />
      <directionalLight color="#00c8ff" intensity={1.8} position={[-5, 1, -2]} />
      <directionalLight color="#004488" intensity={0.9} position={[5, 0, -1]} />
      <directionalLight color="#112233" intensity={0.4} position={[0, 0, 5]} />
      <ambientLight color="#050510" intensity={0.3} />
      <pointLight color="#00f0ff" intensity={2.5} distance={6} position={[0, -2, 1]} />
      <pointLight ref={eyeLeftRef} color="#00f0ff" intensity={4} distance={3} position={[-0.65, 0.28, 1.2]} />
      <pointLight ref={eyeRightRef} color="#00f0ff" intensity={4} distance={3} position={[0.65, 0.28, 1.2]} />
    </>
  );
};

// 3D wrapper that connects R3F scroll state
const SceneContainer = ({ scrollVal }: { scrollVal: number }) => {
  return (
    <>
      <CameraRig />
      <SceneLights />

      <Background />
      <LoaderScene scrollVal={scrollVal} />
      <HeroScene scrollVal={scrollVal} />
    </>
  );
};

// Synchronizer between React HTML and ThreeJS loops
function App() {
  const rawScroll = useScrollProgress();
  const [lerpedScroll, setLerpedScroll] = useState(0);

  // Unified lerp for deterministic HTML and WebGL rendering sync
  useEffect(() => {
    let frameId: number;
    let currentScroll = 0;
    
    // requestAnimationFrame custom loop
    const loop = () => {
      // Lerp on the main thread for both HTML and R3F
      currentScroll = lerp(currentScroll, rawScroll, 0.08); // Factor 0.08 requested
      
      setLerpedScroll(currentScroll);
      
      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frameId);
  }, [rawScroll]);

  return (
    <div className="app-root">
      <div className="canvas-container">
        <Canvas
          id="webgl"
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x080808, 1);
            gl.domElement.style.pointerEvents = 'none';
          }}
        >
          <Suspense fallback={null}>
            <SceneContainer scrollVal={lerpedScroll} />
          </Suspense>
        </Canvas>
      </div>

      <div id="hud-overlay" />

      <div id="site-content">
        <HeroOverlay />

        <div className="scroll-space">
          <TimelineSection scrollVal={lerpedScroll} />
          <ThemesSection scrollVal={lerpedScroll} />
          <FooterSection scrollVal={lerpedScroll} />
        </div>
      </div>
    </div>
  );
}

export default App;
