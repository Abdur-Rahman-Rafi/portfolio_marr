import React, { useState, useEffect } from 'react';
import { 
    BIO as FALLBACK_BIO, 
    SKILLS as FALLBACK_SKILLS, 
    PROJECTS as FALLBACK_PROJECTS, 
    CONTACT as FALLBACK_CONTACT, 
    EXPERIENCE as FALLBACK_EXPERIENCE, 
    EDUCATION as FALLBACK_EDUCATION,
    DEFAULT_CV_PROFILES 
} from '../constants/content';
import { getCvProfiles } from '../services/portfolioService';
import { Download, Printer, X, Loader2, CheckCircle2, Sliders, Sparkles } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Resume = ({ 
    onClose,
    bio: BIO = FALLBACK_BIO,
    skills: SKILLS = FALLBACK_SKILLS,
    projects: PROJECTS = FALLBACK_PROJECTS,
    contact: CONTACT = FALLBACK_CONTACT,
    experience: EXPERIENCE = FALLBACK_EXPERIENCE,
    education: EDUCATION = FALLBACK_EDUCATION,
    initialTrack = 'software'
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [profiles, setProfiles] = useState(DEFAULT_CV_PROFILES);
    const [activeTrack, setActiveTrack] = useState(initialTrack);
    const [isCompactMode, setIsCompactMode] = useState(true); // Default: Strict 1-Page ATS format

    // Load any custom profiles stored in Firestore
    useEffect(() => {
        const loadProfiles = async () => {
            try {
                const fetched = await getCvProfiles();
                if (fetched && fetched.length > 0) {
                    setProfiles(fetched);
                }
            } catch (err) {
                console.warn('Could not load custom CV profiles, using defaults.', err);
            }
        };
        loadProfiles();
    }, []);

    // Get current track data
    const activeProfile = profiles.find(p => p.id === activeTrack) || profiles[0] || DEFAULT_CV_PROFILES[0];

    // Ensure external URLs have a protocol to prevent relative routing (404s)
    const getValidUrl = (url) => {
        if (!url || url === '#') return url;
        const trimmedUrl = url.trim();
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('mailto:')) return trimmedUrl;
        return `https://${trimmedUrl}`;
    };

    // Format full clean URL for print and display (removes https://, www, trailing slashes)
    const formatDisplayUrl = (url) => {
        if (!url || url === '#' || url === '/') return '';
        return url.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    };

    // Filter projects based on track & compact mode
    const displayProjects = React.useMemo(() => {
        if (!PROJECTS || PROJECTS.length === 0) return [];
        if (!isCompactMode) return PROJECTS;

        const targetTitles = activeProfile?.featuredProjectTitles || [];
        const prioritized = PROJECTS.filter(p => targetTitles.includes(p.title));
        const remaining = PROJECTS.filter(p => !targetTitles.includes(p.title));
        
        // In 1-page compact mode, take up to 3 featured projects to fill page substance beautifully
        return [...prioritized, ...remaining].slice(0, 3);
    }, [PROJECTS, activeProfile, isCompactMode]);

    // Filter skills based on track
    const displaySkills = React.useMemo(() => {
        if (!SKILLS || SKILLS.length === 0) return [];
        if (!activeProfile?.skillsCategories || !isCompactMode) return SKILLS;

        const filtered = SKILLS.filter(cat => activeProfile.skillsCategories.includes(cat.category));
        return filtered.length > 0 ? filtered : SKILLS;
    }, [SKILLS, activeProfile, isCompactMode]);

    // Filter and format experience based on track
    const displayExperience = React.useMemo(() => {
        if (!EXPERIENCE || EXPERIENCE.length === 0) return [];
        if (!isCompactMode) return EXPERIENCE;

        const targetRoles = activeProfile?.featuredExperienceRoles || [];
        const prioritized = [...EXPERIENCE].sort((a, b) => {
            const aIdx = targetRoles.indexOf(a.role);
            const bIdx = targetRoles.indexOf(b.role);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return 0;
        });

        // In compact mode, show top 3 experiences with concise bullet points
        return prioritized.slice(0, 3).map(exp => ({
            ...exp,
            description: exp.description ? exp.description.slice(0, 2) : []
        }));
    }, [EXPERIENCE, activeProfile, isCompactMode]);

    // Native Browser Vector Print (100% ATS-Compliant Text-Selectable PDF)
    const handleNativePrint = () => {
        window.print();
    };

    // Fallback html2pdf generator
    const handleSavePDF = async () => {
        setIsGenerating(true);
        const element = document.getElementById('resume-pdf-content');
        
        const cleanName = (BIO?.name || 'Resume').replace(/\s+/g, '_');
        const trackName = activeProfile?.id || 'standard';

        const opt = {
            margin: [8, 8, 8, 8],
            filename: `${cleanName}_${trackName}_CV.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Error creating PDF. Please use the 'Print ATS PDF' option for vector download.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!BIO || !EXPERIENCE || !EDUCATION) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white text-red-600 font-bold">
                DATA LOADING ERROR: CONTENT MISSING
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto font-sans print:static print:bg-white print:h-auto print:overflow-visible resume-modal-wrapper bg-slate-900/80 backdrop-blur-sm">
            {/* Print CSS Rules */}
            <style>{`
                @page { 
                    size: A4 portrait; 
                    margin: 8mm 10mm; 
                }
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .resume-modal-wrapper {
                        position: static !important;
                        background: white !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    .print\\:hidden, .d-print-none { 
                        display: none !important; 
                    }
                    #resume-pdf-content {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 10mm !important;
                        min-height: 297mm !important;
                    }
                    .page-break-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>

            {/* Fixed Backdrop */}
            <div
                className="fixed inset-0 print:hidden cursor-pointer"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Scrollable Container */}
            <div className="relative min-h-full flex flex-col items-center py-3 sm:py-6 px-2 sm:px-4 z-10 pointer-events-none print:p-0 print:block">
                
                {/* ── Top Floating Action & Track Selector Bar (Hidden in Print) ── */}
                <div className="print:hidden w-full max-w-[210mm] mb-3 sm:mb-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col gap-2.5 sm:gap-3">
                    
                    {/* Top Row: Track Selector Tabs & Close */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 mr-2">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <Sparkles size={12} className="text-blue-400" /> Track:
                            </span>
                            <div className="flex items-center gap-1.5">
                                {profiles.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setActiveTrack(p.id)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                            activeTrack === p.id 
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    >
                                        {p.badge || p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                            title="Close preview"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Bottom Row: Format Controls & Download Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                        {/* 1-Page vs Detailed Mode Switcher */}
                        <div className="flex items-center justify-center sm:justify-start gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                            <button
                                onClick={() => setIsCompactMode(true)}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                                    isCompactMode 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <CheckCircle2 size={13} /> Strict 1-Page (ATS)
                            </button>
                            <button
                                onClick={() => setIsCompactMode(false)}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                                    !isCompactMode 
                                        ? 'bg-slate-700 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Sliders size={13} /> Detailed (Full)
                            </button>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNativePrint}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-1.5 rounded-xl shadow-lg transition-all"
                                title="Print or Save as Vector PDF (Highest ATS score)"
                            >
                                <Printer size={14} /> Print / ATS PDF
                            </button>

                            <button
                                onClick={handleSavePDF}
                                disabled={isGenerating}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
                                title="Download Direct PDF"
                            >
                                {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                                {isGenerating ? 'Saving...' : 'Instant Download'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── ATS Resume Document (Calibrated A4) ── */}
                <div className="w-full overflow-x-auto flex justify-center pb-8 print:p-0 print:overflow-visible">
                    <div
                        id="resume-pdf-content"
                        onClick={(e) => e.stopPropagation()}
                        className={`resume-paper w-full max-w-[210mm] bg-white text-gray-900 shadow-2xl rounded-none isolate pointer-events-auto transition-all ${
                            isCompactMode 
                                ? 'p-5 sm:p-[14mm] text-[12.5px] sm:text-[13px] leading-relaxed min-h-auto sm:min-h-[297mm]' 
                                : 'p-6 sm:p-[18mm] text-[13px] sm:text-[14px] leading-normal min-h-auto sm:min-h-[297mm]'
                        }`}
                        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
                    >
                        {/* Header */}
                        <header className="border-b-2 border-gray-900 pb-3.5 mb-4 text-center">
                            <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-tight uppercase text-gray-950 mb-1">
                                {BIO?.name || "Abdur Rahman Rafi"}
                            </h1>
                            <p className="text-xs sm:text-[13.5px] font-bold tracking-wider text-blue-900 uppercase mb-2.5">
                                {activeProfile?.role || BIO?.role}
                            </p>
                            
                            <div className="flex flex-wrap justify-center text-[11.5px] sm:text-[12px] text-gray-700 gap-x-2.5 gap-y-1 font-sans">
                                {(BIO?.address || BIO?.location || CONTACT?.address) && (
                                    <span>{BIO?.address || BIO?.location || CONTACT?.address}</span>
                                )}
                                {(CONTACT?.phone || CONTACT?.contactNo) && (
                                    <>
                                        <span>•</span>
                                        <a href={`tel:${CONTACT?.phone || CONTACT?.contactNo}`} className="text-gray-900 hover:underline font-medium">
                                            {CONTACT?.phone || CONTACT?.contactNo}
                                        </a>
                                    </>
                                )}
                                {CONTACT?.email && (
                                    <>
                                        <span>•</span>
                                        <a href={`mailto:${CONTACT?.email}`} className="text-blue-900 hover:underline font-medium">
                                            {CONTACT?.email}
                                        </a>
                                    </>
                                )}
                                {CONTACT?.linkedin && (
                                    <>
                                        <span>•</span>
                                        <a href={getValidUrl(CONTACT?.linkedin)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">
                                            {formatDisplayUrl(CONTACT?.linkedin) || 'LinkedIn'}
                                        </a>
                                    </>
                                )}
                                {CONTACT?.github && (
                                    <>
                                        <span>•</span>
                                        <a href={getValidUrl(CONTACT?.github)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">
                                            {formatDisplayUrl(CONTACT?.github) || 'GitHub'}
                                        </a>
                                    </>
                                )}
                            </div>
                        </header>

                        {/* Professional Summary */}
                        <section className="mb-4 page-break-avoid">
                            <h2 className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                                Professional Summary
                            </h2>
                            <p className="text-gray-800 text-justify text-[12px] sm:text-[12.5px] leading-relaxed">
                                {activeProfile?.summary || BIO?.summary}
                            </p>
                        </section>

                        {/* Technical / Core Skills */}
                        <section className="mb-4 page-break-avoid">
                            <h2 className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                                Core Competencies & Skills
                            </h2>
                            <div className="space-y-1.5 text-[12px] sm:text-[12.5px]">
                                {displaySkills.map((skillGroup, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                        <span className="font-bold text-gray-950 font-sans text-[11.5px] sm:text-[12px]">{skillGroup.category}:</span>
                                        <span className="text-gray-800 leading-snug">{skillGroup.items.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Relevant Experience */}
                        <section className="mb-4">
                            <h2 className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-2 font-sans">
                                Relevant Experience
                            </h2>
                            <div className="space-y-3">
                                {displayExperience.map((exp, index) => (
                                    <div key={index} className="page-break-avoid">
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                            <h3 className="font-bold text-gray-950 text-[12.5px] sm:text-[13px]">{exp.role}</h3>
                                            <span className="text-[11.5px] font-medium text-gray-600 font-sans">{exp.duration}</span>
                                        </div>
                                        <div className="text-[11.5px] sm:text-[12px] font-semibold text-blue-900 italic mb-1">{exp.company}</div>
                                        <ul className="list-disc list-outside ml-4 text-[11.5px] sm:text-[12px] text-gray-800 space-y-0.5 leading-snug">
                                            {exp.description?.map((desc, i) => (
                                                <li key={i} className="pl-0.5">{desc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Selected Projects */}
                        <section className="mb-4">
                            <h2 className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-2 font-sans">
                                Selected Projects
                            </h2>
                            <div className="space-y-3">
                                {displayProjects.map((project, index) => (
                                    <div key={index} className="page-break-avoid">
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <h3 className="font-bold text-gray-950 text-[12.5px] sm:text-[13px]">{project.title}</h3>
                                                {project.link && project.link !== '#' && (
                                                    <a href={getValidUrl(project.link)} target="_blank" rel="noreferrer" className="text-[11px] text-blue-800 hover:underline font-mono">
                                                        ({formatDisplayUrl(project.link)})
                                                    </a>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-gray-600 font-sans font-medium">
                                                {project.tech?.slice(0, 4).join(' • ')}
                                            </span>
                                        </div>
                                        <p className="text-[11.5px] sm:text-[12px] text-gray-800 leading-snug mt-0.5">
                                            {project.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="page-break-avoid">
                            <h2 className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                                Education
                            </h2>
                            <div className="space-y-1.5">
                                {EDUCATION?.map((edu, index) => (
                                    <div key={index} className="flex justify-between items-start text-[12px] sm:text-[12.5px]">
                                        <div>
                                            <span className="font-bold text-gray-950">{edu.degree}</span>
                                            <span className="text-gray-700"> — {edu.institution}</span>
                                            {edu.description && <span className="text-gray-600 italic"> ({edu.description})</span>}
                                        </div>
                                        <span className="text-[11px] sm:text-[11.5px] font-medium text-gray-600 font-sans whitespace-nowrap ml-2">
                                            {edu.duration}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                </div>
            </div>

            </div>
        </div>
    );
};

export default Resume;