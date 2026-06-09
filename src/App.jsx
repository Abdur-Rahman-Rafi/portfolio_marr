import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import BootSequence from './components/BootSequence';
import CRTOverlay from './components/CRTOverlay';
import Terminal from './components/Terminal';
import AudioPlayer from './components/AudioPlayer';
import Resume from './components/Resume';
import { AnimatePresence, motion } from 'framer-motion';
import { LeftSidebar, RightSidebar } from './components/HackerSidebars';
import MouseTrails from './components/MouseTrails';

const App = () => {
    const [booting, setBooting] = useState(true);
    const [glitching, setGlitching] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showResume, setShowResume] = useState(false);

    const handleCommand = (cmd) => {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 200);

        if (cmd === 'resume') {
            setShowResume(true);
        }
    };

    // Sound Effect Logic
    // Use ref to persist AudioContext across renders and avoid hitting browser limits
    const audioContextRef = React.useRef(null);

    const playTypingSound = useCallback(() => {
        // Initialize AudioContext lazily on first interaction (browser policy)
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioContextRef.current = new AudioContext();
            }
        }

        const ctx = audioContextRef.current;
        if (ctx && ctx.state === 'running') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            // Higher starting pitch dropping fast for a "click"
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

            // Perussive envelope
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.03);
        } else if (ctx && ctx.state === 'suspended') {
            // Resume if suspended (common in some browsers)
            ctx.resume();
        }
    }, []);

    useEffect(() => {
        const handleGlobalKeyDown = () => playTypingSound();
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [playTypingSound]);

    // Also import MouseTrails at top

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-black font-mono">
            <div className="print:hidden">
                <MouseTrails />
            </div>
            <AnimatePresence>
                {booting ? (
                    <BootSequence key="boot" onComplete={() => setBooting(false)} />
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className={`w-full h-full relative ${glitching ? 'crt-flicker grayscale' : ''} print:hidden`}
                    >
                        {/* 3D Background */}
                        <Scene />



                        {/* Immersive Hacker UI Layout */}
                        <div className="absolute inset-0 flex flex-col lg:flex-row p-2 md:p-4 gap-2 md:gap-4 z-10 pointer-events-none">
                            {/* Left Hacker elements - Desktop */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="hidden lg:flex pointer-events-none"
                            >
                                <LeftSidebar />
                            </motion.div>

                            {/* Central Terminal Hub */}
                            <div className="flex-1 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full max-w-4xl h-[85vh] md:h-[75vh] bg-black/80 border border-neon-green/30 rounded-lg shadow-[0_0_50px_rgba(0,255,156,0.15)] overflow-hidden pointer-events-auto backdrop-blur-md flex flex-col"
                                >
                                    <div className="bg-neon-green/10 px-2 md:px-4 py-1 md:py-2 border-b border-neon-green/20 flex justify-between items-center bg-black/40">
                                        <div className="flex items-center space-x-1 md:space-x-2">
                                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#ff5f56]" />
                                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#ffbd2e]" />
                                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#27c93f]" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] text-neon-green uppercase tracking-widest font-bold">RAFI_SYSTEM // CENTRAL_HUB</span>
                                        <div className="flex space-x-2">
                                            {/* Mobile Sidebar Toggle */}
                                            <button
                                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                                className="lg:hidden text-neon-green hover:text-neon-cyan focus:outline-none pointer-events-auto"
                                            >
                                                <span className="text-[10px]">[SYS_MON]</span>
                                            </button>
                                            <div className="hidden lg:block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neon-green/60 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative">
                                        <Terminal onCommand={handleCommand} playTypingSound={playTypingSound} />

                                        {/* Mobile Sidebar Overlay */}
                                        <AnimatePresence>
                                            {showMobileMenu && (
                                                <motion.div
                                                    initial={{ x: '100%' }}
                                                    animate={{ x: 0 }}
                                                    exit={{ x: '100%' }}
                                                    transition={{ type: 'spring', damping: 20 }}
                                                    className="absolute inset-0 bg-black/95 z-50 flex flex-col p-4 overflow-y-auto lg:hidden pointer-events-auto border-l border-neon-green/20"
                                                >
                                                    <div className="flex justify-between items-center mb-4 border-b border-neon-green/20 pb-2">
                                                        <span className="text-neon-green text-xs tracking-widest">SYSTEM_MONITOR</span>
                                                        <button
                                                            onClick={() => setShowMobileMenu(false)}
                                                            className="text-red-500 hover:text-red-400 text-xs"
                                                        >
                                                            [CLOSE]
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <LeftSidebar />
                                                        <RightSidebar />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Hacker elements - Desktop */}
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="hidden lg:flex pointer-events-none"
                            >
                                <RightSidebar />
                            </motion.div>
                        </div>

                        {/* Audio Controls */}
                        <AudioPlayer />

                        <CRTOverlay />
                    </motion.div>
                )}
            </AnimatePresence>

            {!booting && (
                <div className="fixed bottom-2 right-2 md:bottom-4 md:right-4 z-[120] text-[8px] md:text-[10px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer flex items-center space-x-1 md:space-x-2 print:hidden">
                    <span>RAFI_OS :: TERMINAL_ACTIVE</span>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neon-green animate-pulse" />
                </div>
            )}
            {/* Resume Overlay - Placed outside of transformed containers */}
            {showResume && <Resume onClose={() => setShowResume(false)} />}
        </main>
    );
}

export default App;
