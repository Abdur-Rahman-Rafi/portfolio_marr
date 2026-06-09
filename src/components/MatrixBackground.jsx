import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MatrixBackground = () => {
    const count = 2000;
    const meshRef = useRef();

    const [particles, velocities] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const v = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 40;
            p[i * 3 + 1] = (Math.random() - 0.5) * 40;
            p[i * 3 + 2] = (Math.random() - 0.5) * 40;
            v[i] = Math.random() * 0.05 + 0.01;
        }
        return [p, v];
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current || !meshRef.current.geometry.attributes.position) return;
        const positions = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            positions.setY(i, positions.getY(i) - velocities[i]);
            if (positions.getY(i) < -20) {
                positions.setY(i, 20);
            }
        }
        positions.needsUpdate = true;
        meshRef.current.rotation.y += 0.001;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#00ff9c"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
};

export default MatrixBackground;
