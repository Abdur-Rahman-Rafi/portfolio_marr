import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BIO, SKILLS, PROJECTS, EXPERIENCE, EDUCATION } from '../constants/content';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hi! I'm Rafi's AI assistant. Feel free to ask me anything about his skills, projects, or experience!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiKeyExists, setApiKeyExists] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            setApiKeyExists(false);
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: "⚠️ It looks like the Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file to activate me." 
            }]);
        }
    }, []);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || !apiKeyExists) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            
            // Construct context from portfolio constants
            const portfolioContext = `
                You are Rafi's interactive portfolio assistant. Your job is to answer questions about Rafi's professional background, skills, and projects in a friendly, helpful, and concise manner.
                Do not make up information; rely only on the following details:
                
                Name: ${BIO.name}
                Role: ${BIO.role}
                Summary: ${BIO.summary}
                
                Skills: ${JSON.stringify(SKILLS)}
                Projects: ${JSON.stringify(PROJECTS)}
                Experience: ${JSON.stringify(EXPERIENCE)}
                Education: ${JSON.stringify(EDUCATION)}

                Keep your answers brief (1-3 paragraphs max) and professional. If you don't know the answer, direct them to contact Rafi via email.
            `;

            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: portfolioContext
            });

            // Format previous messages for Gemini history
            const history = messages.slice(1).map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            const chat = model.startChat({ history });
            const result = await chat.sendMessage(userMsg);
            const response = await result.response;
            
            setMessages(prev => [...prev, { role: 'model', text: response.text() }]);
        } catch (error) {
            console.error("Gemini AI Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to my AI brain. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(59,130,246,0.3)', backdropFilter: 'blur(16px)', height: '450px' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'linear-gradient(90deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' }}>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-100">Rafi AI Assistant</h3>
                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1 text-blue-400">
                                            <Bot size={12} />
                                        </div>
                                    )}
                                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 justify-start">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                                        <Bot size={12} />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700 flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-blue-400" />
                                        <span className="text-xs text-slate-400 animate-pulse">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 border-t flex gap-2" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(0,0,0,0.2)' }}>
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about Rafi..."
                                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                                disabled={isLoading || !apiKeyExists}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading || !apiKeyExists}
                                className="p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-500 transition-colors flex items-center justify-center"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${
                    isOpen ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}
                style={{ boxShadow: isOpen ? 'none' : '0 10px 25px rgba(59,130,246,0.4)' }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
};

export default Chatbot;
