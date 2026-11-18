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
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

    // Instant PDF Download (Guaranteed strict 1-page fit without page overflow or cut text)
    const handleSavePDF = async () => {
        setIsGenerating(true);
        const originalElement = document.getElementById('resume-pdf-content');
        if (!originalElement) {
            setIsGenerating(false);
            return;
        }

        const cleanName = (BIO?.name || 'Resume').replace(/\s+/g, '_');
        const trackName = activeProfile?.id || 'standard';
        const filename = `${cleanName}_${trackName}_CV.pdf`;

        // Clone element offscreen with fixed standard A4 width (794px / 210mm).
        // This ensures the downloaded PDF is 100% identical and pixel-perfect whether generated on PC, tablet, or mobile!
        const clone = originalElement.cloneNode(true);
        clone.id = 'resume-pdf-clone';
        clone.style.width = '794px';
        clone.style.minWidth = '794px';
        clone.style.maxWidth = '794px';
        clone.style.position = 'fixed';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.zIndex = '-99999';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';
        clone.style.border = 'none';
        clone.style.transform = 'none';
        clone.style.boxSizing = 'border-box';
        document.body.appendChild(clone);

        try {
            // Render DOM to high-res 2x canvas
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = 210;
            const pdfHeight = 297;
            const contentRatio = canvas.height / canvas.width;
            const calculatedHeight = pdfWidth * contentRatio;

            if (isCompactMode) {
                // Strict 1-Page ATS Mode: Guaranteed to fit on exactly 1 single page!
                if (calculatedHeight <= pdfHeight) {
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, calculatedHeight, undefined, 'FAST');
                } else {
                    // Safe proportional scale so that content never spills to page 2 or cuts text
                    const scaleFactor = pdfHeight / calculatedHeight;
                    const fittedWidth = pdfWidth * scaleFactor;
                    const offsetX = (pdfWidth - fittedWidth) / 2;
                    pdf.addImage(imgData, 'JPEG', offsetX, 0, fittedWidth, pdfHeight, undefined, 'FAST');
                }
            } else {
                // Detailed Multi-page Mode
                let heightLeft = calculatedHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = heightLeft - calculatedHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
                    heightLeft -= pdfHeight;
                }
            }

            pdf.save(filename);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Error creating PDF. Please use the 'Print / ATS PDF' option for vector download.");
        } finally {
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
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
                    margin: 0; 
                }
                @media print {
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .resume-modal-wrapper {
                        position: static !important;
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }
                    .print\\:hidden, .d-print-none { 
                        display: none !important; 
                    }
                    #resume-pdf-content {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 auto !important;
                        width: 210mm !important;
                        max-width: 210mm !important;
                        box-sizing: border-box !important;
                    }
                    .compact-resume-page {
                        max-height: 297mm !important;
                        height: 297mm !important;
                        overflow: hidden !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        break-after: avoid !important;
                        break-inside: avoid !important;
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
                                ? 'compact-resume-page p-4 sm:p-[8mm_12mm] text-[11.5px] leading-snug' 
                                : 'p-6 sm:p-[16mm] text-[13px] leading-normal'
                        }`}
                        style={{ 
                            fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Header */}
                        <header className="border-b-2 border-gray-900 pb-2 mb-2 text-center">
                            <h1 className="text-[22px] sm:text-[25px] font-extrabold tracking-tight uppercase text-gray-950 mb-0.5">
                                {BIO?.name || "Abdur Rahman Rafi"}
                            </h1>
                            <p className="text-[11px] sm:text-[12px] font-bold tracking-wider text-blue-900 uppercase mb-1.5">
                                {activeProfile?.role || BIO?.role}
                            </p>
                            
                            <div className="flex flex-wrap justify-center text-[10.5px] sm:text-[11px] text-gray-700 gap-x-2 gap-y-0.5 font-sans leading-tight">
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
                                            {formatDisplayUrl(CONTACT?.linkedin) || 'linkedin.com/in/rafi1438'}
                                        </a>
                                    </>
                                )}
                                {CONTACT?.github && (
                                    <>
                                        <span>•</span>
                                        <a href={getValidUrl(CONTACT?.github)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">
                                            {formatDisplayUrl(CONTACT?.github) || 'github.com/Abdur-Rahman-Rafi'}
                                        </a>
                                    </>
                                )}
                            </div>
                        </header>

                        {/* Professional Summary */}
                        <section className="mb-2 page-break-avoid">
                            <h2 className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1 font-sans">
                                Professional Summary
                            </h2>
                            <p className="text-gray-800 text-justify text-[11px] sm:text-[11.5px] leading-snug">
                                {activeProfile?.summary || BIO?.summary}
                            </p>
                        </section>

                        {/* Technical / Core Skills */}
                        <section className="mb-2 page-break-avoid">
                            <h2 className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1 font-sans">
                                Core Competencies & Skills
                            </h2>
                            <div className="space-y-1 text-[11px] sm:text-[11.5px]">
                                {displaySkills.map((skillGroup, index) => (
                                    <div key={index} className="grid grid-cols-[135px_1fr] items-baseline">
                                        <span className="font-bold text-gray-950 font-sans text-[11px] sm:text-[11.5px]">{skillGroup.category}:</span>
                                        <span className="text-gray-800 leading-snug">{skillGroup.items.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Relevant Experience */}
                        <section className="mb-2">
                            <h2 className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                                Relevant Experience
                            </h2>
                            <div className="space-y-1.5">
                                {displayExperience.map((exp, index) => (
                                    <div key={index} className="page-break-avoid">
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                            <h3 className="font-bold text-gray-950 text-[11.5px] sm:text-[12px]">{exp.role}</h3>
                                            <span className="text-[10.5px] sm:text-[11px] font-medium text-gray-600 font-sans">{exp.duration}</span>
                                        </div>
                                        <div className="text-[10.5px] sm:text-[11px] font-semibold text-blue-900 italic mb-0.5">{exp.company}</div>
                                        <ul className="list-disc list-outside ml-3.5 text-[10.5px] sm:text-[11px] text-gray-800 space-y-0.5 leading-snug">
                                            {exp.description?.map((desc, i) => (
                                                <li key={i} className="pl-0.5">{desc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Selected Projects */}
                        <section className="mb-2">
                            <h2 className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
                                Selected Projects
                            </h2>
                            <div className="space-y-1.5">
                                {displayProjects.map((project, index) => (
                                    <div key={index} className="page-break-avoid">
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <h3 className="font-bold text-gray-950 text-[11.5px] sm:text-[12px]">{project.title}</h3>
                                                {project.link && project.link !== '#' && (
                                                    <a href={getValidUrl(project.link)} target="_blank" rel="noreferrer" className="text-[10px] sm:text-[10.5px] text-blue-800 hover:underline font-mono">
                                                        ({formatDisplayUrl(project.link)})
                                                    </a>
                                                )}
                                            </div>
                                            <span className="text-[10px] sm:text-[10.5px] text-gray-600 font-sans font-medium">
                                                {project.tech?.slice(0, 4).join(' • ')}
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] sm:text-[11px] text-gray-800 leading-snug mt-0.5">
                                            {project.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="page-break-avoid mb-0">
                            <h2 className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1 font-sans">
                                Education
                            </h2>
                            <div className="space-y-1">
                                {EDUCATION?.map((edu, index) => (
                                    <div key={index} className="flex justify-between items-start text-[11px] sm:text-[11.5px]">
                                        <div>
                                            <span className="font-bold text-gray-950">{edu.degree}</span>
                                            <span className="text-gray-700"> — {edu.institution}</span>
                                            {edu.description && <span className="text-gray-600 italic"> ({edu.description})</span>}
                                        </div>
                                        <span className="text-[10.5px] sm:text-[11px] font-medium text-gray-600 font-sans whitespace-nowrap ml-2">
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