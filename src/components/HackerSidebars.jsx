import React, { useState, useEffect, Suspense } from 'react';
import DottedPortrait from './DottedPortrait';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';

export const LeftSidebar = () => {
    const [stats, setStats] = useState({ cpu: 12, ram: 45, net: 2 });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 20 + 5),
                ram: Math.floor(Math.random() * 5 + 40),
                net: Math.floor(Math.random() * 50 + 10)
            });
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-64 flex flex-col space-y-4 pointer-events-auto">
            <div className="hacker-panel p-4 flex flex-col items-center">
                <div className="w-full text-[10px] text-neon-green/40 mb-2 border-b border-neon-green/10 pb-1 flex justify-between">
                    <span>IDENT_MODULE</span>
                    <span>v2.1.0</span>
                </div>
                <div className="w-full h-48 bg-black/40 border border-neon-green/20 relative overflow-hidden group">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-neon-green text-[10px] animate-pulse">LOADING_BIO...</div>}>
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                            <ambientLight intensity={1} />
                            <pointLight position={[10, 10, 10]} />
                            <DottedPortrait />
                        </Canvas>
                    </Suspense>
                    <div className="absolute inset-0 bg-neon-green/5 pointer-events-none group-hover:bg-neon-green/10 transition-colors" />
                </div>
                <div className="w-full mt-4 space-y-2">
                    <StatusItem label="CPU_LOAD" value={stats.cpu} />
                    <StatusItem label="MEM_USED" value={stats.ram} />
                    <StatusItem label="NET_TRAF" value={stats.net} />
                </div>
            </div>

            <div className="hacker-panel p-4 flex-1 opacity-60">
                <div className="text-[10px] text-neon-green/40 mb-2 border-b border-neon-green/10 pb-1">
                    SUB_SYSTEM_MNT
                </div>
                <div className="space-y-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center text-[8px] text-neon-green/40">
                            <span className="w-12 truncate">PROCESS_{i}02</span>
                            <span className="bg-neon-green/20 px-1 rounded">RUNNING</span>
                            <span>{Math.floor(Math.random() * 100)}ms</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const RightSidebar = () => {
    const [hexData, setHexData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newHex = Array.from({ length: 4 }, () =>
                Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase()
            ).join(' ');

            setHexData(prev => [newHex, ...prev].slice(0, 20));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-64 flex flex-col pointer-events-auto">
            <div className="hacker-panel p-4 flex-1 flex flex-col">
                <div className="text-[10px] text-neon-cyan/40 mb-2 border-b border-neon-cyan/10 pb-1 flex justify-between">
                    <span>ENCRYPTED_FEED</span>
                    <span className="animate-pulse">● LIVE</span>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className="data-stream space-y-1">
                        {hexData.map((hex, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-neon-cyan/60"
                            >
                                {hex}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusItem = ({ label, value }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] text-neon-green">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="status-bar-bg">
            <div className="status-bar-fill" style={{ width: `${value}%` }} />
        </div>
    </div>
);

// Fallback default export if needed, though we will use named exports
const HackerSidebars = () => {
    return (
        <div className="absolute inset-0 pointer-events-none flex justify-between p-4 z-20">
            <LeftSidebar />
            <RightSidebar />
        </div>
    );
};

export default HackerSidebars;
