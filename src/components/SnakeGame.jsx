import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const ROWS = 15;
const COLS = 30;

const SnakeGame = ({ onClose }) => {
    const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [food, setFood] = useState({ x: 10, y: 10 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const gameLoopRef = useRef();

    const generateFood = useCallback(() => {
        return {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    }, []);

    const resetGame = () => {
        setSnake([{ x: 5, y: 5 }]);
        setDirection({ x: 1, y: 0 });
        setFood(generateFood());
        setGameOver(false);
        setScore(0);
        setIsPaused(false);
    };

    const handleKeyDown = useCallback((e) => {
        if (gameOver) {
            if (e.key === 'Enter') resetGame();
            if (e.key === 'Escape') onClose();
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) setDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (direction.y === 0) setDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (direction.x === 0) setDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (direction.x === 0) setDirection({ x: 1, y: 0 });
                break;
            case 'p':
                setIsPaused(prev => !prev);
                break;
            case 'Escape':
                onClose();
                break;
            default:
                break;
        }
    }, [direction, gameOver, onClose]);

    useEffect(() => {
        const moveSnake = () => {
            if (gameOver || isPaused) return;

            setSnake(prevSnake => {
                const head = prevSnake[0];
                const newHead = { x: head.x + direction.x, y: head.y + direction.y };

                // Collision detection
                if (
                    newHead.x < 0 || newHead.x >= COLS ||
                    newHead.y < 0 || newHead.y >= ROWS ||
                    prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
                ) {
                    setGameOver(true);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Eat food
                if (newHead.x === food.x && newHead.y === food.y) {
                    setFood(generateFood());
                    setScore(prev => prev + 10);
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        };

        gameLoopRef.current = setInterval(moveSnake, 150);
        return () => clearInterval(gameLoopRef.current);
    }, [direction, food, gameOver, isPaused, generateFood]);

    // Global Key Listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="flex flex-col items-center justify-center p-4 border border-neon-green bg-black/80 font-mono text-neon-green">
            <div className="flex justify-between w-full mb-2 text-xs">
                <span>SCORE: {score}</span>
                <span>[ESC] EXIT</span>
            </div>

            <div
                className="relative bg-black/90 border border-neon-green/50"
                style={{ width: COLS * GRID_SIZE, height: ROWS * GRID_SIZE }}
            >
                {/* Snake */}
                {snake.map((segment, i) => (
                    <div
                        key={i}
                        className="absolute bg-neon-green"
                        style={{
                            width: GRID_SIZE - 2,
                            height: GRID_SIZE - 2,
                            left: segment.x * GRID_SIZE + 1,
                            top: segment.y * GRID_SIZE + 1,
                            opacity: i === 0 ? 1 : 0.7
                        }}
                    />
                ))}

                {/* Food */}
                <div
                    className="absolute bg-neon-red animate-pulse"
                    style={{
                        width: GRID_SIZE - 2,
                        height: GRID_SIZE - 2,
                        left: food.x * GRID_SIZE + 1,
                        top: food.y * GRID_SIZE + 1,
                        borderRadius: '50%'
                    }}
                />

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-neon-red">
                        <h3 className="text-xl font-bold mb-2">GAME OVER</h3>
                        <p className="text-sm text-neon-green">[ENTER] RESTART</p>
                        <p className="text-sm text-neon-green">[ESC] EXIT</p>
                    </div>
                )}

                {isPaused && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-neon-amber">
                        <h3 className="text-xl font-bold">PAUSED</h3>
                    </div>
                )}
            </div>

            <div className="mt-2 text-[10px] text-neon-green/60">
                ARROWS to move • P to pause
            </div>
        </div>
    );
};

export default SnakeGame;
