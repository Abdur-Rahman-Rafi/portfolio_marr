import React, { useState, useEffect, useRef } from 'react';
import { BIO, SKILLS, PROJECTS, CONTACT, ASCII_ART } from '../constants/content';
import Typewriter from './Typewriter';
import DecryptionEffect from './DecryptionEffect';
import SnakeGame from './SnakeGame';

const Terminal = ({ onCommand, playTypingSound }) => {
    const [history, setHistory] = useState([
        { id: 'welcome', type: 'output', content: 'WELCOME TO RAFI_OS V1.0.0' },
        { id: 'help-hint', type: 'output', content: "Type 'help' to see available commands." },
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [commandHistory, setCommandHistory] = useState([]);
    const terminalEndRef = useRef(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const [showSnake, setShowSnake] = useState(false);

    // ... existing refs and scroll logic
    const scrollToBottom = () => {
        if (containerRef.current) {
            requestAnimationFrame(() => {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            });
        }
    };
    // ... existing useEffects

    useEffect(() => {
        scrollToBottom();
    }, [history, isProcessing, showSnake]); // Added showSnake dependency

    useEffect(() => {
        const handleGlobalClick = () => {
            if (!showSnake) inputRef.current?.focus(); // Only auto-focus if not playing snake
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [showSnake]);

    const simulateKaliExecution = async (cleanCmd) => {
        setIsProcessing(true);

        const logs = [
            `> INITIALIZING SECURE TUNNEL FOR [${cleanCmd.toUpperCase()}]...`,
            `> REQUESTING ACCESS TO REMOTE CLUSTER...`,
            `> PINGING LOCAL NODE... DONE`,
            `> EXECUTING KERNEL HOOK [0x${Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase()}]...`,
            `> ENCRYPTING PAYLOAD...`,
            `> COMMAND INJECTION SUCCESSFUL.`,
        ];

        for (const log of logs) {
            setHistory(prev => [...prev, { id: `log-${Date.now()}-${Math.random()}`, type: 'log', content: log }]);
            await new Promise(resolve => setTimeout(() => {
                scrollToBottom();
                resolve();
            }, 100 + Math.random() * 150));
        }

        setIsProcessing(false);
    };

    const handleCommand = async (cmd) => {
        const cleanCmd = cmd.toLowerCase().trim();
        if (!cleanCmd) return;

        setCommandHistory(prev => [cmd, ...prev]);
        setHistoryIndex(-1);
        setHistory(prev => [...prev, { id: `input-${Date.now()}`, type: 'input', content: cmd }]);

        if (onCommand) onCommand(cleanCmd);

        if (cleanCmd !== 'clear' && cleanCmd !== 'snake') {
            await simulateKaliExecution(cleanCmd);
        }

        let response = '';
        switch (cleanCmd) {
            case 'help':
                response = `AVAILABLE COMMANDS:

INFO:
  about      - Display bio and background
  whoami     - Show ASCII art signature
  skills     - List technical skills
  projects   - View project portfolio
  contact    - Get contact information
  resume     - Open resume/GitHub

SYSTEM:
  clear      - Clear terminal history
  ls         - List system files
  neofetch   - Display system info
  theme      - Change color scheme
  
FUN:
  snake      - Play Snake game
  matrix     - Enter the Matrix
  hack       - Initiate hacking sequence
  coffee     - Brew some coffee
  sudo       - Try privilege escalation
  exit       - Close terminal`;
                break;
            case 'about':
                response = `${BIO.name} - ${BIO.role}\nLocation: ${BIO.location}\n\n${BIO.summary}\n\n${BIO.detailed}`;
                break;
            case 'whoami':
                response = ASCII_ART;
                break;
            case 'skills':
                response = SKILLS.map(s => `${s.category.toUpperCase()}:\n  ${s.items.join(', ')}`).join('\n\n');
                break;
            case 'projects':
                response = PROJECTS.map(p => `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▸ ${p.title.toUpperCase()}
  ${p.description}
  
  Stack: ${p.tech.join(' • ')}
  Link: ${p.link}`).join('\n\n');
                break;
            case 'contact':
                response = `EMAIL: ${CONTACT.email}\nGITHUB: ${CONTACT.github}\nLINKEDIN: ${CONTACT.linkedin}\nFACEBOOK: ${CONTACT.facebook}`;
                break;
            case 'resume':
                response = 'GENERATING SECURE DOCUMENT... [OPENING PREVIEW]';
                // Trigger logic handled in parent component
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'exit':
                response = 'TERMINATING SESSION...';
                setTimeout(() => window.close(), 2000);
                break;
            case 'sudo':
                response = 'ACCESS ERROR: Unauthorized privilege escalation attempt detected.';
                break;
            case 'ls':
                response = `total 42
drwxr-xr-x  5 rafi  staff   160 Jan 15 19:30 .
drwxr-xr-x  8 rafi  staff   256 Jan 15 19:30 ..
-rw-r--r--  1 rafi  staff  2048 Jan 15 19:30 about.txt
-rw-r--r--  1 rafi  staff  4096 Jan 15 19:30 projects.db
-rw-r--r--  1 rafi  staff  1024 Jan 15 19:30 skills.json
-rwxr-xr-x  1 rafi  staff  8192 Jan 15 19:30 resume.pdf
drwxr-xr-x  3 rafi  staff    96 Jan 15 19:30 secrets/`;
                break;
            case 'matrix':
                response = `Wake up, Neo...
The Matrix has you...
Follow the white rabbit.

Knock, knock, Neo.

01001101 01100001 01110100 01110010 01101001 01111000`;
                break;


            // ... (in Terminal switch case)
            case 'snake':
                setShowSnake(true);
                response = 'LAUNCHING RETRO_PROTOCOL_V2 [SNAKE]...';
                break;
            case 'theme':
                response = `USAGE: theme <color>
AVAILABLE THEMES: green, red, amber, blue`;
                break;
            case 'hack':
                response = `[INITIALIZING HACK SEQUENCE]
> Scanning network... 192.168.1.1
> Bypassing firewall... SUCCESS
> Injecting payload... COMPLETE
> Root access... GRANTED

Just kidding! I'm a frontend developer, not a hacker 😄`;
                break;
            case 'coffee':
                response = `
      ( (
       ) )
    ........
    |      |]
    \      /
     ------

Brewing coffee... ☕
[████████████████████] 100%

Your coffee is ready! Time to code.`;
                break;
            case 'neofetch':
                response = `
     ██████╗  █████╗ ███████╗██╗
     ██╔══██╗██╔══██╗██╔════╝██║
     ██████╔╝███████║█████╗  ██║
     ██╔══██╗██╔══██║██╔══╝  ██║
     ██║  ██║██║  ██║██║     ██║
     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝

     OS: RAFI_OS v1.0.0
     Host: Portfolio Terminal
     Kernel: React 18.3.1
     Uptime: ${Math.floor(Math.random() * 100)} days
     Shell: bash 5.2.0
     Resolution: ${window.innerWidth}x${window.innerHeight}
     Theme: Cyberpunk Green
     CPU: Creativity Engine (8 cores)
     GPU: Three.js Renderer
     Memory: Infinite Ideas`;
                break;
            default:
                // Check for dynamic commands like 'theme <color>'
                if (cleanCmd.startsWith('theme ')) {
                    const themeName = cleanCmd.split(' ')[1];
                    const validThemes = ['red', 'amber', 'blue', 'green'];

                    if (validThemes.includes(themeName)) {
                        if (themeName === 'green') {
                            document.documentElement.removeAttribute('data-theme');
                        } else {
                            document.documentElement.setAttribute('data-theme', themeName);
                        }
                        response = `> THEME SYSTEM RELOADED
> APPLIED VISUAL PATCH: [${themeName.toUpperCase()}]`;
                    } else {
                        response = `ERROR: Theme '${themeName}' not found. Available: ${validThemes.join(', ')}`;
                    }
                } else {
                    response = `ERROR: '${cleanCmd}' is not recognized as an internal or external command.`;
                }
        }

        setHistory(prev => [
            ...prev,
            { id: `output-${Date.now()}-${Math.random()}`, type: 'output', content: response },
            { id: `summary-${Date.now()}-${Math.random()}`, type: 'summary', content: `COMMAND '${cleanCmd.toUpperCase()}' EXECUTED AT ${new Date().toLocaleTimeString()}` }
        ]);

        // Ensure scroll after all content is added
        setTimeout(scrollToBottom, 100);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isProcessing) {
            handleCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full font-mono text-[10px] sm:text-xs md:text-sm p-2 md:p-4 overflow-y-auto custom-scrollbar bg-black/20"
        >
            <div className="flex-1 space-y-2">
                {history.map((entry) => (
                    <div key={entry.id} className={
                        entry.type === 'input' ? 'text-neon-cyan' :
                            entry.type === 'log' ? 'text-white/40 italic text-[10px]' :
                                entry.type === 'summary' ? 'terminal-summary-line text-[10px] text-neon-green/60 uppercase tracking-widest' :
                                    'text-neon-green break-words whitespace-pre-wrap'
                    }>
                        {entry.type === 'input' && <span className="mr-2">$</span>}
                        {entry.type === 'output' ? (
                            <DecryptionEffect text={entry.content} onComplete={scrollToBottom} playTypingSound={playTypingSound} />
                        ) : (
                            <span>{entry.content}</span>
                        )}
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex flex-col space-y-2 mt-4 max-w-xs">
                        <div className="flex justify-between text-[10px] text-neon-cyan animate-pulse">
                            <span>EXECUTING TASK...</span>
                            <span>{Math.floor(Math.random() * 30 + 70)}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-[2px]">
                            <div className="terminal-progress-bar" />
                        </div>
                        <div className="text-[9px] text-white/20 italic">
                            Kernel process ID: {Math.floor(Math.random() * 10000)}
                        </div>
                    </div>
                )}

                {/* Snake Game Overlay */}
                {showSnake && (
                    <div className="my-2">
                        <SnakeGame onClose={() => {
                            setShowSnake(false);
                            setHistory(prev => [...prev, { id: `log-${Date.now()}`, type: 'log', content: 'GAME SESSION TERMINATED.' }]);
                            // Refocus input after closing
                            setTimeout(() => inputRef.current?.focus(), 100);
                        }} />
                    </div>
                )}
                <div ref={terminalEndRef} />
            </div>

            {/* Quick Actions / Function Keys */}
            <div className="flex flex-wrap gap-2 mb-2 px-1 pt-2 border-t border-neon-green/10">
                {['help', 'about', 'skills', 'projects', 'resume', 'contact', 'clear'].map(cmd => (
                    <button
                        key={cmd}
                        onClick={() => handleCommand(cmd)}
                        disabled={isProcessing}
                        className="px-2 py-1 text-[10px] bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 hover:text-neon-cyan transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        [{cmd.toUpperCase()}]
                    </button>
                ))}
            </div>

            <div className="flex items-center mt-2 sticky bottom-0 bg-black/90 py-2 border-t border-neon-green/5">
                <span className="text-neon-cyan mr-2">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    disabled={isProcessing}
                    className="bg-transparent border-none outline-none flex-1 text-neon-green placeholder:opacity-20"
                    placeholder={isProcessing ? "WAITING..." : "ENTER COMMAND..."}
                    spellCheck="false"
                    autoComplete="off"
                />
                {!isProcessing && <span className="w-2 h-5 bg-neon-green animate-pulse ml-1" />}
            </div>
        </div>
    );
};

export default Terminal;
