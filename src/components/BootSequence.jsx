import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOT_LOGS } from '../constants/content';

const BootSequence = ({ onComplete }) => {
    const [started, setStarted] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);
    const [logs, setLogs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleStart = () => {
        setStarted(true);

        // Audio Welcome & Caution
        if ('speechSynthesis' in window) {
            const warningMsg = "Caution. Secure server detected. Identity verification required... Access Granted. Welcome to the Raffi's Universe.";
            const utterance = new SpeechSynthesisUtterance(warningMsg);
            utterance.pitch = 0.8;
            utterance.rate = 0.85; // Slightly slower for dramatic effect
            utterance.volume = 1;

            // Try to find a robotic sounding voice
            const voices = window.speechSynthesis.getVoices();
            const roboticVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft David'));
            if (roboticVoice) utterance.voice = roboticVoice;

            window.speechSynthesis.speak(utterance);
        }

        setTimeout(() => setAccessGranted(true), 2500); // Increased delay to match warning TTS
    };

    useEffect(() => {
        // Pre-load voices
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    useEffect(() => {
        if (accessGranted && currentIndex < BOOT_LOGS.length) {
            const timeout = setTimeout(() => {
                setLogs(prev => [...prev, BOOT_LOGS[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, Math.random() * 200 + 50); // Slightly faster boot for better UX
            return () => clearTimeout(timeout);
        } else if (accessGranted && currentIndex >= BOOT_LOGS.length) {
            const finishTimeout = setTimeout(onComplete, 1000);
            return () => clearTimeout(finishTimeout);
        }
    }, [accessGranted, currentIndex, onComplete]);

    return (
        <div className="fixed inset-0 z-[200] bg-black p-8 font-mono flex flex-col justify-center items-center">
            {!started ? (
                <button
                    onClick={handleStart}
                    className="group flex flex-col items-center gap-4 cursor-pointer focus:outline-none"
                    aria-label="Start System"
                >
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-2 border-neon-green/30 flex items-center justify-center group-hover:border-neon-green transition-colors duration-500">
                            <div className="w-20 h-20 rounded-full border border-neon-green/50 animate-pulse-slow flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center group-hover:bg-neon-green/20 transition-all">
                                    <span className="text-3xl animate-pulse">⚡</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 rounded-full border border-transparent border-t-neon-green/60 animate-spin transition-all duration-1000" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl text-neon-green font-bold tracking-widest mb-1 group-hover:shadow-[0_0_10px_rgba(0,255,156,0.5)] transition-shadow">SYSTEM STANDBY</h2>
                        <p className="text-xs text-neon-green/60 tracking-[0.2em] animate-pulse">CLICK TO INITIALIZE</p>
                    </div>
                </button>
            ) : !accessGranted ? (
                <div className="text-center animate-pulse flex flex-col items-center">
                    <div className="text-neon-red font-bold tracking-[0.5em] text-sm md:text-xl mb-4 animate-bounce">CAUTION: SECURE CONNECTION</div>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-neon-green tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(0,255,156,0.8)]">ACCESS GRANTED</h2>
                    <div className="w-64 h-2 bg-neon-green/20 overflow-hidden rounded">
                        <div className="h-full bg-neon-green animate-[progress-loading_2s_ease-out_forwards]" />
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-3xl h-full flex flex-col justify-start mt-20 md:mt-0">
                    {/* Normal Boot logs */}
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-1 text-sm md:text-base ${log.includes('WARN') ? 'text-neon-red' : 'text-neon-green'}`}
                        >
                            {log}
                        </motion.div>
                    ))}
                    {currentIndex < BOOT_LOGS.length && (
                        <span className="w-2 h-5 bg-neon-green inline-block animate-pulse ml-1" />
                    )}
                </div>
            )}
        </div>
    );
};

export default BootSequence;
