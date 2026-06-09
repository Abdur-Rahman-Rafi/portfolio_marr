import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WorldGlobe = () => {
    const pointsRef = useRef();
    const ringsRef = useRef();

    // Generate dots on a sphere surface
    const particles = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const radius = 2.5;

        for (let i = 0; i < count; i++) {
            // Fibonacci sphere distribution for even dot placement
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }, []);

    // Rotation animation
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.003;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
        if (ringsRef.current) {
            ringsRef.current.rotation.y += 0.003;
        }
    });

    return (
        <group position={[0, 0, 5]}>
            {/* Dotted sphere */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.length / 3}
                        array={particles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.08}
                    color="#00ff9c"
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Rotating rings for extra effect */}
            <group ref={ringsRef}>
                {/* Equator ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.5, 0.02, 16, 100]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} />
                </mesh>

                {/* Latitude rings */}
                {[...Array(4)].map((_, i) => (
                    <mesh key={`lat-${i}`} rotation={[0, 0, (Math.PI / 4) * i]}>
                        <torusGeometry args={[2.5, 0.015, 16, 100]} />
                        <meshBasicMaterial color="#00ff9c" transparent opacity={0.6} />
                    </mesh>
                ))}

                {/* Outer scanning ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.8, 0.025, 16, 100]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={0.7} />
                </mesh>
            </group>
        </group>
    );
};

export default WorldGlobe;
