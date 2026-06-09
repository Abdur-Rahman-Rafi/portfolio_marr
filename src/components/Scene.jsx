import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import MatrixBackground from './MatrixBackground';
import WorldGlobe from './WorldGlobe';

const Scene = () => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <color attach="background" args={['#000']} />

                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff9c" />

                <Suspense fallback={null}>
                    <MatrixBackground />
                    <WorldGlobe />
                    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Scene;
