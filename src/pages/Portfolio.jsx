import React, { useState, useEffect, useRef } from 'react';
import { BIO as FALLBACK_BIO, SKILLS as FALLBACK_SKILLS, PROJECTS as FALLBACK_PROJECTS, EXPERIENCE as FALLBACK_EXPERIENCE, EDUCATION as FALLBACK_EDUCATION, CONTACT as FALLBACK_CONTACT, CERTIFICATIONS as FALLBACK_CERTIFICATIONS } from '../constants/content';
import Resume from '../components/Resume';
import { Download, Mail, ExternalLink, Github, Linkedin, Briefcase, Code, ChevronRight, MapPin, GraduationCap, ArrowUp, Facebook, Terminal, Shield, Cpu, Globe, Award } from 'lucide-react';
import { getProfileInfo, getProjects } from '../services/portfolioService';
import { motion, useInView } from 'framer-motion';
import { AlbumSection } from '../components/AlbumManager';

// ── Typewriter Hook ──────────────────────────────────────────
const useTypewriter = (words, speed = 80, pause = 2000) => {
    const [display, setDisplay] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = words[wordIndex % words.length];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setDisplay(current.slice(0, display.length + 1));
                if (display.length + 1 === current.length) {
                    setTimeout(() => setIsDeleting(true), pause);
                }
            } else {
                setDisplay(current.slice(0, display.length - 1));
                if (display.length === 0) {
                    setIsDeleting(false);
                    setWordIndex(i => i + 1);
                }
            }
        }, isDeleting ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [display, isDeleting, wordIndex, words, speed, pause]);

    return display;
};

// ── Animated Counter ─────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1500;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return <span ref={ref}>{count}{suffix}</span>;
};

// ── Skill Category Icons ─────────────────────────────────────
const categoryIcon = (cat) => {
    if (cat.toLowerCase().includes('web')) return <Globe size={18} />;
    if (cat.toLowerCase().includes('security')) return <Shield size={18} />;
    if (cat.toLowerCase().includes('tools')) return <Terminal size={18} />;
    return <Cpu size={18} />;
};

const categoryColors = {
    0: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', pill: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    1: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', pill: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    2: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', pill: 'bg-violet-500/20 text-violet-300 border border-violet-500/30' },
    3: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', pill: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
};

// ── Main Component ───────────────────────────────────────────
const Portfolio = () => {
    const [showResume, setShowResume] = useState(false);
    const [showBackTop, setShowBackTop] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [profile, setProfile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const roles = ['Web Developer', 'AI & ML Enthusiast', 'Cybersecurity Specialist', 'CS Engineer'];
    const typedRole = useTypewriter(roles);

    // Google Drive URL converter
    const getDisplayUrl = (url) => {
        if (!url) return url;
        const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match?.[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1500`;
        return url;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pInfo = await getProfileInfo();
                const pList = await getProjects();
                if (pInfo) setProfile(pInfo);
                if (pList?.length > 0) setProjects(pList);
            } catch (error) {
                console.error('Failed to fetch from Firebase, using fallbacks.', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Back-to-top & active section tracking
    useEffect(() => {
        const onScroll = () => {
            setShowBackTop(window.scrollY > 400);
            const sections = ['home', 'about', 'skills', 'projects', 'experience', 'education', 'contact'];
            for (const id of [...sections].reverse()) {
                const el = document.getElementById(id);
                if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const BIO = profile?.bio || FALLBACK_BIO;
    const SKILLS = profile?.skills || FALLBACK_SKILLS;
    const PROJECTS = projects.length > 0 ? projects : FALLBACK_PROJECTS;
    const EXPERIENCE = profile?.experience || FALLBACK_EXPERIENCE;
    const EDUCATION = profile?.education || FALLBACK_EDUCATION;
    const CONTACT = profile?.contact || FALLBACK_CONTACT;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                <p className="text-slate-400 font-mono text-sm tracking-widest">Loading rafi.io...</p>
            </div>
        );
    }

    const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
    const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

    const navLinks = [
        { id: 'about', label: 'About' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'experience', label: 'Experience' },
        { id: 'education', label: 'Education' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <div className="min-h-screen text-slate-100 overflow-x-hidden relative" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#0a0f1e' }}>

            {/* ── Subtle Grid Background ── */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-20"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-15"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />

            {/* ── Navigation ── */}
            <nav className="fixed w-full z-50 top-0" style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => scrollTo('home')} className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <span className="text-blue-400">rafi</span><span className="text-slate-300">.io</span>
                    </button>
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <button key={link.id} onClick={() => scrollTo(link.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === link.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                                {link.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowResume(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 border border-blue-500/40 hover:bg-blue-500/10 transition-all">
                        <Download size={15} /> Resume
                    </button>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section id="home" className="relative pt-32 pb-28 px-6 z-10">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={stagger}
                        className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                        {/* Profile Image */}
                        <motion.div variants={fadeUp} className="relative shrink-0 order-1 lg:order-2">
                            <div className="absolute -inset-4 rounded-full opacity-30 blur-2xl"
                                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8), rgba(139,92,246,0.6))' }} />
                            <div className="relative rounded-full p-1" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)' }}>
                                <img
                                    src={getDisplayUrl(BIO.avatar) || '/profile.jpeg'}
                                    alt={BIO.name}
                                    className="w-56 h-56 md:w-72 md:h-72 rounded-full object-cover"
                                    style={{ border: '4px solid #0a0f1e' }}
                                />
                            </div>

                        </motion.div>

                        {/* Text */}
                        <div className="order-2 lg:order-1 text-center lg:text-left">
                            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6"
                                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                                <Terminal size={12} /> {'<'} Computer Science & Engineering {'>'}
                            </motion.div>

                            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-3 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                <span className="text-slate-100">Hi, I'm </span>
                                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Rafi
                                </span>
                            </motion.h1>

                            {/* Typewriter role */}
                            <motion.div variants={fadeUp} className="text-xl md:text-2xl font-semibold mb-6 h-9 flex items-center justify-center lg:justify-start gap-2"
                                style={{ color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}>
                                <span className="text-blue-400">{'>'}</span>
                                <span className="text-slate-200">{typedRole}</span>
                                <span className="w-0.5 h-6 bg-blue-400 animate-pulse" />
                            </motion.div>

                            {/* Status badge */}
                            <motion.div variants={fadeUp} className="flex justify-center lg:justify-start mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Open to Opportunities
                                </div>
                            </motion.div>

                            <motion.p variants={fadeUp} className="text-base md:text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                                {BIO.summary}
                            </motion.p>

                            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <button onClick={() => setShowResume(true)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 20px rgba(59,130,246,0.3)', color: '#fff' }}>
                                    <Download size={16} /> Download Resume
                                </button>
                                <button onClick={() => scrollTo('contact')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 text-slate-300"
                                    style={{ border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(255,255,255,0.04)' }}>
                                    <Mail size={16} /> Get in Touch
                                </button>
                                <div className="flex gap-2">
                                    <a href={CONTACT?.github} target="_blank" rel="noreferrer"
                                        className="p-3 rounded-xl transition-all hover:-translate-y-0.5 text-slate-400 hover:text-white"
                                        style={{ border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.04)' }}>
                                        <Github size={18} />
                                    </a>
                                    <a href={CONTACT?.linkedin} target="_blank" rel="noreferrer"
                                        className="p-3 rounded-xl transition-all hover:-translate-y-0.5 text-slate-400 hover:text-blue-400"
                                        style={{ border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.04)' }}>
                                        <Linkedin size={18} />
                                    </a>
                                    <a href={`mailto:${CONTACT?.email}`}
                                        className="p-3 rounded-xl transition-all hover:-translate-y-0.5 text-slate-400 hover:text-emerald-400"
                                        style={{ border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.04)' }}>
                                        <Mail size={18} />
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <section className="relative z-10 py-10 px-6" style={{ borderTop: '1px solid rgba(59,130,246,0.1)', borderBottom: '1px solid rgba(59,130,246,0.1)', background: 'rgba(59,130,246,0.03)' }}>
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Projects Built', target: 7, suffix: '+' },
                        { label: 'Years Experience', target: 3, suffix: '+' },
                        { label: 'Technologies', target: 20, suffix: '+' },
                        { label: 'Internships', target: 2, suffix: '' },
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }} className="text-center">
                            <div className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#60a5fa' }}>
                                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── About Section ── */}
            <section id="about" className="relative z-10 py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader icon={<Code size={22} />} title="About Me" color="#3b82f6" />
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                            <p className="text-slate-400 leading-relaxed mb-5 text-base">
                                I'm a <span className="text-blue-400 font-semibold">Computer Science & Engineering</span> student at United International University, passionate about building systems that sit at the intersection of software development, AI, and cybersecurity.
                            </p>
                            <p className="text-slate-400 leading-relaxed mb-5 text-base">
                                {BIO.detailed || "Skilled in React, Node.js, Python, Linux, and network security fundamentals, with a proven ability to combine development expertise and security best practices to deliver reliable, user-focused applications."}
                            </p>
                            <p className="text-slate-400 leading-relaxed text-base">
                                I believe great software is not just about functionality — it's about <span className="text-violet-400 font-semibold">security</span>, <span className="text-emerald-400 font-semibold">performance</span>, and <span className="text-blue-400 font-semibold">clean engineering</span>.
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                            className="space-y-4">
                            {[
                                { icon: <MapPin size={16} />, label: 'Location', value: BIO.location || 'Dhaka, Bangladesh' },
                                { icon: <GraduationCap size={16} />, label: 'University', value: 'United International University' },
                                { icon: <Briefcase size={16} />, label: 'Degree', value: 'B.Sc. in CS & Engineering' },
                                { icon: <Terminal size={16} />, label: 'Focus', value: 'AI · ML · Web · Cybersecurity' },
                                { icon: <Code size={16} />, label: 'Status', value: 'Open to Full-Time / Internship' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5"
                                    style={{ border: '1px solid rgba(148,163,184,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="p-2 rounded-lg text-blue-400" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.label}</div>
                                        <div className="text-slate-200 text-sm font-medium mt-0.5">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Skills Section ── */}
            <section id="skills" className="relative z-10 py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-6xl mx-auto">
                    <SectionHeader icon={<Cpu size={22} />} title="Skills & Technologies" color="#8b5cf6" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SKILLS.map((skill, i) => {
                            const c = categoryColors[i % 4];
                            return (
                                <motion.div key={i}
                                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`rounded-2xl p-6 border ${c.bg} ${c.border} hover:scale-105 transition-all duration-300`}>
                                    <div className={`flex items-center gap-2 ${c.text} font-semibold text-sm mb-4`}
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {categoryIcon(skill.category)}
                                        {skill.category}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {skill.items.map((item, j) => (
                                            <span key={j} className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.pill}`}>
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Projects Section ── */}
            <section id="projects" className="relative z-10 py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader icon={<Code size={22} />} title="Featured Projects" color="#06b6d4" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PROJECTS.filter(p => !p.hidden).map((project, idx) => (
                            <motion.div key={idx}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-default relative overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                        <Code size={18} className="text-blue-400" />
                                    </div>
                                    {project.link && project.link !== '#' && (
                                        <a href={project.link} target="_blank" rel="noreferrer"
                                            className="p-2 rounded-lg text-slate-500 hover:text-blue-400 transition-colors"
                                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    {project.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(project.tech || []).slice(0, 4).map((t, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded-md font-mono text-blue-300"
                                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Experience Section ── */}
            <section id="experience" className="relative z-10 py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-4xl mx-auto">
                    <SectionHeader icon={<Briefcase size={22} />} title="Experience" color="#10b981" />
                    <div className="relative pl-8" style={{ borderLeft: '2px solid rgba(59,130,246,0.25)' }}>
                        {EXPERIENCE.map((exp, idx) => (
                            <motion.div key={idx}
                                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="relative mb-10 last:mb-0">
                                {/* Timeline dot */}
                                <div className="absolute -left-11 top-1 w-4 h-4 rounded-full border-2 border-blue-500 bg-[#0a0f1e]" />
                                <div className="p-6 rounded-2xl transition-all hover:bg-white/5"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{exp.role}</h3>
                                            <p className="text-blue-400 text-sm font-semibold">{exp.company}</p>
                                        </div>
                                        <span className="text-xs font-mono px-3 py-1.5 rounded-full self-start sm:self-auto"
                                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                                            {exp.duration}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {exp.description.map((d, i) => (
                                            <li key={i} className="text-slate-400 text-sm flex gap-3">
                                                <ChevronRight size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Education Section ── */}
            <section id="education" className="relative z-10 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <SectionHeader icon={<GraduationCap size={22} />} title="Education" color="#f59e0b" />
                    <div className="grid sm:grid-cols-2 gap-6">
                        {EDUCATION.map((edu, idx) => (
                            <motion.div key={idx}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        <GraduationCap size={18} className="text-amber-400" />
                                    </div>
                                    <span className="text-xs font-mono text-amber-400 px-2 py-1 rounded-full"
                                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        {edu.duration}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-100 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{edu.degree}</h3>
                                <p className="text-amber-400 text-sm font-semibold mb-3">{edu.institution}</p>
                                <p className="text-slate-400 text-sm">{edu.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Certifications Section ── */}
            <section id="certifications" className="relative z-10 py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-6xl mx-auto">
                    <SectionHeader icon={<Award size={22} />} title="Certifications" color="#f59e0b" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FALLBACK_CERTIFICATIONS.map((cert, idx) => (
                            <motion.div key={idx}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cert.color}30` }}>
                                {/* Left color accent bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: cert.color }} />
                                {/* Glow on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                                    style={{ background: `radial-gradient(ellipse at top left, ${cert.color}10, transparent 70%)` }} />
                                <div className="pl-3 relative z-10">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-3xl">{cert.icon}</span>
                                        <span className="text-xs font-mono px-2.5 py-1 rounded-full"
                                            style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}30`, color: cert.color }}>
                                            {cert.date}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-100 mb-1 leading-snug group-hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {cert.title}
                                    </h3>
                                    <p className="text-xs font-medium mb-4" style={{ color: cert.color }}>
                                        {cert.issuer}
                                    </p>
                                    {cert.link && cert.link !== '#' && (
                                        <a href={cert.link} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:gap-2"
                                            style={{ color: cert.color }}>
                                            <ExternalLink size={11} /> Verify Certificate
                                        </a>
                                    )}
                                    {(!cert.link || cert.link === '#') && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                            <Award size={11} /> Verified
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Album Section ── */}
            <section className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <AlbumSection />
            </section>

            {/* ── Contact Section ── */}
            <section id="contact" className="relative z-10 py-28 px-6" style={{ borderTop: '1px solid rgba(59,130,246,0.1)', background: 'rgba(59,130,246,0.02)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6"
                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                            <Terminal size={12} /> Available for Work
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Let's <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Build</span> Something
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            Whether it's a web app, an AI system, or a security audit — I'm always open to new challenges and collaborations.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT?.email}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg text-white"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 30px rgba(59,130,246,0.25)' }}>
                                <Mail size={16} /> Send Email
                            </a>
                            <a href={CONTACT?.github} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 text-slate-300"
                                style={{ border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.04)' }}>
                                <Github size={16} /> GitHub
                            </a>
                            <a href={CONTACT?.linkedin} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 text-blue-400"
                                style={{ border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}>
                                <Linkedin size={16} /> LinkedIn
                            </a>
                            <a href={CONTACT?.facebook} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 text-blue-300"
                                style={{ border: '1px solid rgba(96,165,250,0.25)', background: 'rgba(96,165,250,0.05)' }}>
                                <Facebook size={16} /> Facebook
                            </a>
                        </div>


                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="relative z-10 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-slate-500 text-sm font-mono">
                    © {new Date().getFullYear()} <span className="text-blue-400">rafi.io</span> — {BIO.name}. All rights reserved.
                </p>
            </footer>

            {/* ── Resume Modal ── */}
            {showResume && (
                <Resume onClose={() => setShowResume(false)} bio={BIO} skills={SKILLS}
                    projects={PROJECTS} experience={EXPERIENCE} education={EDUCATION} contact={CONTACT} />
            )}

            {/* ── Back to Top ── */}
            {showBackTop && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 z-50 p-3 rounded-xl text-white transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                    <ArrowUp size={18} />
                </motion.button>
            )}
        </div>
    );
};

// ── Section Header Component ─────────────────────────────────
const SectionHeader = ({ icon, title, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="flex flex-col items-center text-center mb-14">
        <div className="p-3 rounded-xl mb-4" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
            {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
        </h2>
        <div className="mt-3 h-1 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </motion.div>
);

export default Portfolio;
