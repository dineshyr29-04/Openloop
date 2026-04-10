import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { usePhase } from '../../hooks/usePhase';

// Components
import { HeroScene } from '../HeroScene';
import { Background } from '../Background';
import { HeroOverlay } from '../HeroOverlay';
import { LoaderScene } from '../LoaderScene';
import { Timeline3D } from '../Timeline3D';
import { SponsorsSection } from '../SponsorsSection';
import { useMousePosition } from '../../hooks/useMousePosition';
import { lerp, clamp } from '../../utils/math';
import Lenis from 'lenis';

import '../../App.css';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const CameraRig = ({ robotProgressRef }: { robotProgressRef: React.MutableRefObject<number> }) => {
  const mouse = useMousePosition();
  
  useFrame((state) => {
    const p = robotProgressRef.current;
    
    // 1. Mouse Parallax (Controlled shift)
    const targetX = mouse.x * 0.45;
    const targetY = mouse.y * 0.45;
    
    // 2. Camera Push / Inside System Feel
    let targetZ = 3.8;
    if (p > 0.75) {
      const pushP = Math.min(1, (p - 0.75) * 5);
      targetZ = lerp(3.8, 2.0, pushP);
    }

    state.camera.position.x = lerp(state.camera.position.x, targetX, 0.08);
    state.camera.position.y = lerp(state.camera.position.y, targetY, 0.08);
    state.camera.position.z = lerp(state.camera.position.z, targetZ, 0.08);
    
    state.camera.lookAt(0, 0, 0); 
  });
  return null;
};

const SceneLights = ({ robotProgressRef: _robotProgressRef }: { robotProgressRef: React.MutableRefObject<number> }) => {
  return (
    <>
      <directionalLight color="#ffffff" intensity={2.0} position={[0, 2, -4]} />
      <directionalLight color="#C6FF00" intensity={0.5} position={[-5, 1, -2]} />
      <directionalLight color="#AFFF00" intensity={0.5} position={[5, 0, -1]} />
      <directionalLight color="#0a1200" intensity={0.4} position={[0, 0, 5]} />
      <ambientLight color="#000000" intensity={0.2} />
      <pointLight color="#C6FF00" intensity={1.2} distance={8} position={[0, -3, 0]} />
    </>
  );
};

const SceneContainer = ({
  scrollVal,
  robotProgressRef,
  themeProgressRef,
  mouseX,
  phase,
}: {
  scrollVal: number;
  robotProgressRef: React.MutableRefObject<number>;
  themeProgressRef: React.MutableRefObject<number>;
  mouseX: number;
  phase: string;
}) => {
  return (
    <>
      <CameraRig robotProgressRef={robotProgressRef} />
      <SceneLights robotProgressRef={robotProgressRef} />

      <Background scrollVal={scrollVal} />
      <Timeline3D scrollProgress={robotProgressRef.current} />
      <HeroScene
        scrollVal={scrollVal}
        robotProgressRef={robotProgressRef}
        themeProgressRef={themeProgressRef}
        mouseX={mouseX}
        phase={phase}
      />
    </>
  );
};

export default function DesktopLayout() {
  const rawScroll = useScrollProgress();
  const mouse = useMousePosition();
  const { phase, loaderProgress } = usePhase();
  const robotProgressRef = useRef(0);
  const themeProgressRef = useRef(0);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  useEffect(() => {
    if (phase === 'loader' || phase === 'intro') {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      setScrollEnabled(false);
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      setScrollEnabled(true);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'main') return;

    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let context: gsap.Context | null = null;
    let rafId: number;

    const sections = ['#s1-hero', '#s2-about', '#s3-features', '#s4-timeline'];

    const setupTimeout = setTimeout(() => {
      const cards = ['#card-1', '#card-2', '#card-3']
        .map((id) => document.querySelector<HTMLElement>(id))
        .filter((el): el is HTMLElement => Boolean(el));
      const footer = document.querySelector<HTMLElement>('#footer-section');

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      const scrollLoop = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(scrollLoop);
      };
      rafId = requestAnimationFrame(scrollLoop);

      lenis.on('scroll', ScrollTrigger.update);

      sections.forEach((selector, index) => {
        const el = document.querySelector<HTMLElement>(selector);
        if (el) {
          el.style.opacity = index === 0 ? '1' : '0';
          el.style.visibility = index === 0 ? 'visible' : 'hidden';
          el.style.display = 'block';
        }
      });

      context = gsap.context(() => {
        // Single Unified Scroll Orchestration
        ScrollTrigger.create({
          trigger: '.app-root',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            robotProgressRef.current = p;

            // Debug HUD Update (if element exists)
            const hud = document.querySelector<HTMLElement>('#debug-hud');
            if (hud) {
              let activeSection = 'HERO';
              if (p >= 0.20 && p < 0.45) activeSection = 'TIMELINE';
              else if (p >= 0.45 && p < 0.70) activeSection = 'THEMES';
              else if (p >= 0.70 && p < 0.90) activeSection = 'SPONSORS';
              else if (p >= 0.90) activeSection = 'FOOTER';
              hud.innerText = `P: ${p.toFixed(3)} | SECTION: ${activeSection}`;
            }

            // Global Visibility Logic
            const getOpacity = (val: number, start: number, end: number, fade = 0.05) => {
              if (val < start || val > end) return 0;
              if (val < start + fade) return (val - start) / fade;
              if (val > end - fade) return (end - val) / fade;
              return 1;
            };

            // 1. Hero Overlay
            const heroEl = document.querySelector<HTMLElement>('#s1-hero');
            if (heroEl) {
              const op = getOpacity(p, 0.00, 0.20);
              heroEl.style.opacity = String(op);
              heroEl.style.visibility = op > 0.01 ? 'visible' : 'hidden';
              heroEl.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
            }

            // 2. Timeline Overlay
            const tlEl = document.querySelector<HTMLElement>('#s4-timeline');
            if (tlEl) {
              const op = getOpacity(p, 0.20, 0.45);
              tlEl.style.opacity = String(op);
              tlEl.style.visibility = op > 0.01 ? 'visible' : 'hidden';
              tlEl.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
            }

            // 3. Themes Card Visibility
            const themeEl = document.querySelector<HTMLElement>('#theme-section');
            if (themeEl) {
              const op = getOpacity(p, 0.45, 0.70);
              themeEl.style.opacity = String(op);
              themeEl.style.visibility = op > 0.01 ? 'visible' : 'hidden';
              themeEl.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
              
              // Themes specific card movement
              if (op > 0) {
                const themeP = clamp((p - 0.45) / 0.25, 0, 1);
                themeProgressRef.current = themeP;
                
                cards.forEach((card, i) => {
                  const perCard = 0.2;
                  const cardStart = i * perCard * 0.5;
                  const cardP = clamp((themeP - cardStart) / 0.4, 0, 1);
                  
                  // Refined theme layout choreography
                  let x = 0;
                  let scale = 1;
                  let zIndex = 10 + i;
                  
                  if (themeP < 0.6) {
                    x = lerp(-120, -5 * (cards.length - 1 - i), easeOut(cardP));
                    scale = lerp(1.1, 1 - i * 0.04, cardP);
                  } else {
                    const assembleP = clamp((themeP - 0.6) / 0.4, 0, 1);
                    const gridPositions = [-35, 0, 35];
                    x = lerp(-5 * (cards.length - 1 - i), gridPositions[i], easeInOut(assembleP));
                  }
                  
                  card.style.top = '50%';
                  card.style.left = '50%';
                  card.style.transform = `translateX(calc(${x}vw - 50%)) translateY(-50%) scale(${scale})`;
                  card.style.opacity = String(clamp(op * 2, 0, 1));
                  card.style.zIndex = String(zIndex);
                });
              }
            }

            // 4. Sponsors Overlay
            const spEl = document.querySelector<HTMLElement>('#sponsors-section');
            if (spEl) {
              const op = getOpacity(p, 0.70, 0.90);
              spEl.style.opacity = String(op);
              spEl.style.visibility = op > 0.01 ? 'visible' : 'hidden';
              spEl.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
            }

            // 5. Footer Overlay
            if (footer) {
              const op = getOpacity(p, 0.90, 1.00);
              footer.style.opacity = String(op);
              footer.style.visibility = op > 0.01 ? 'visible' : 'hidden';
              footer.style.transform = `translateY(${lerp(50, 0, op)}px)`;
            }
          },
        });
      });
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(setupTimeout);
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      context?.revert();
    };
  }, [phase]);

  return (
    <div className={`app-root ${phase === 'main' ? 'is-main' : ''}`}>
      {phase === 'main' && (
        <div id="debug-hud" style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: '#C6FF00',
          padding: '8px 12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          zIndex: 1000,
          border: '1px solid #C6FF00'
        }}>
          P: 0.000 | SECTION: HERO
        </div>
      )}

      <div className="canvas-container">
        <Canvas
          id="webgl"
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 1);
            gl.domElement.style.pointerEvents = 'none';
          }}
        >
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#0a1a00" wireframe />
            </mesh>
          }>
            {phase === 'loader' || phase === 'intro' ? (
              <LoaderScene progress={loaderProgress} phase={phase} />
            ) : (
              <SceneContainer
                scrollVal={rawScroll}
                robotProgressRef={robotProgressRef}
                themeProgressRef={themeProgressRef}
                mouseX={mouse.x}
                phase={phase}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      <div id="hud-overlay" />

      {phase === 'main' && (
        <div id="site-content" style={{ display: scrollEnabled ? 'block' : 'none' }}>
          <HeroOverlay scrollProgress={rawScroll} />
          <SponsorsSection scrollProgress={rawScroll} />
        </div>
      )}
    </div>
  );
}
