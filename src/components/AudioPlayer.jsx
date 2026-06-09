import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.4;
        }
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setHasError(false);
                    })
                    .catch(err => {
                        console.error("Audio playback error:", err);
                        setHasError(true);
                    });
            }
        }
    };

    const handleAudioError = (e) => {
        console.error("Audio source error:", e);
        // If the first source (bgm.mp3) fails, it will try the next ones in the DOM
    };

    return (
        <div
            className={`fixed top-4 right-4 z-[150] flex items-center space-x-3 bg-black/60 backdrop-blur-md border ${hasError ? 'border-red-500/50' : 'border-neon-green/30'} p-2 rounded-full px-4 hover:border-neon-green/60 transition-all cursor-pointer group`}
            onClick={togglePlay}
            title={hasError ? "Audio Load Error" : "Toggle Background Music"}
        >
            <audio
                ref={audioRef}
                loop
                onEmptied={() => console.log("Audio emptied")}
                onError={handleAudioError}
            >
                <source src="/bgm.mp3" type="audio/mpeg" />
                <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>

            <div className="flex items-end space-x-1 h-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1 bg-neon-green transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1 opacity-30'}`}
                        style={{
                            height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.4s'
                        }}
                    />
                ))}
            </div>

            <span className="text-[10px] text-neon-green font-mono uppercase tracking-tighter">
                {hasError ? 'LD_ERROR' : (isPlaying ? 'AUDIO:ON' : 'AUDIO:OFF')}
            </span>

            {isPlaying ? (
                <Volume2 size={14} className="text-neon-green" />
            ) : (
                <VolumeX size={14} className={`${hasError ? 'text-red-500' : 'text-neon-green/50'}`} />
            )}
        </div>
    );
};

export default AudioPlayer;
