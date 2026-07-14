import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const DottedPortrait = () => {
    const meshRef = useRef();

    // Load the texture
    const texture = useLoader(THREE.TextureLoader, '/profile.jpeg');

    const { positions, colors, sizes } = useMemo(() => {
        if (!texture || !texture.image) {
            return { positions: new Float32Array(), colors: new Float32Array(), sizes: new Float32Array() };
        }

        const img = texture.image;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Increase resolution slightly for better detail
        const width = 150;
        const height = 150;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height).data;

        const p = [];
        const c = [];
        const s = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = imageData[index] / 255;
                const g = imageData[index + 1] / 255;
                const b = imageData[index + 2] / 255;
                const a = imageData[index + 3] / 255;

                // Lower brightness threshold and boost visibility
                const brightness = (r + g + b) / 3;
                if (a > 0.2 && brightness > 0.05) {
                    const posX = (x - width / 2) * 0.08;
                    const posY = (height / 2 - y) * 0.08;
                    const posZ = (Math.random() - 0.5) * 0.3;

                    p.push(posX, posY, posZ);

                    // Boost the green channel and normalize others for neon effect
                    const boost = 1.5;
                    c.push(r * 0.3, Math.min(1, g * boost + 0.2), b * 0.3);

                    // Slightly larger points for visibility
                    s.push(brightness * 0.12);
                }
            }
        }

        // If no points found (e.g. image still loading incorrectly), add a placeholder
        if (p.length === 0) {
            p.push(0, 0, 0);
            c.push(0, 1, 0);
            s.push(0.1);
        }

        return {
            positions: new Float32Array(p),
            colors: new Float32Array(c),
            sizes: new Float32Array(s)
        };
    }, [texture]);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    });

    return (
        <points ref={meshRef} position={[0, -1, -2]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.9}
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default DottedPortrait;
