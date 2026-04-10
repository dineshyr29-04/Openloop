import React from 'react';
import { Environment } from '@react-three/drei';
import { Robot } from './Robot';
import { Background } from './Background';

interface SceneContainerProps {
  scrollVal: number;
  robotProgressRef: React.MutableRefObject<number>;
  themeProgressRef: React.MutableRefObject<number>;
  mouseX: number;
  phase: string;
  isVisible: boolean;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  scrollVal,
  robotProgressRef,
  themeProgressRef,
  mouseX,
  phase,
  isVisible,
}) => {
  return (
    <>
      <Environment preset="city" />
      
      <Background scrollVal={scrollVal} />
      <Robot
        scrollVal={scrollVal}
        robotProgressRef={robotProgressRef}
        themeProgressRef={themeProgressRef}
        mouseX={mouseX}
        phase={phase}
        isVisible={isVisible}
      />
    </>
  );
};
