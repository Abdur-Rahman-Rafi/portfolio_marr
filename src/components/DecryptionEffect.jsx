import React, { useState, useEffect } from 'react';

const DecryptionEffect = ({ text, delay = 15, onComplete, playTypingSound }) => {
    const [displayText, setDisplayText] = useState('');
    const [hasAnimated, setHasAnimated] = useState(false);
    const chars = "01010101ABCDEF0123456789█▓▒░";

    useEffect(() => {
        // If already animated, just show the final text
        if (hasAnimated) {
            setDisplayText(text);
            return;
        }

        let iteration = 0;
        const interval = setInterval(() => {
            // Play sound occasionally (10% chance) to simulate processing noise without being annoying
            if (playTypingSound && Math.random() > 0.9) playTypingSound();

            setDisplayText(prev =>
                text.split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
                setHasAnimated(true);
                if (onComplete) onComplete();
            }

            iteration += 1 / 2;
        }, delay);

        return () => clearInterval(interval);
    }, [text, delay, onComplete, hasAnimated, chars, playTypingSound]);

    return <span className="font-mono">{displayText}</span>;
};

export default DecryptionEffect;
