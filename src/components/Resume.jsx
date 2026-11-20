import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { Download, Printer, X, CheckCircle2, Sliders, Sparkles, FileText } from 'lucide-react';

// ─── Utility helpers ──────────────────────────────────────────────────────────
const getValidUrl = (url) => {
    if (!url || url === '#') return url;
    const t = url.trim();
    if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('mailto:')) return t;
    return `https://${t}`;
};

const formatDisplayUrl = (url) => {
    if (!url || url === '#' || url === '/') return '';
    return url.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

// ─── Build the full standalone HTML string for a true-text A4 PDF ─────────────
const buildResumeHTML = ({ BIO, SKILLS, PROJECTS, CONTACT, EXPERIENCE, EDUCATION, activeProfile, displaySkills, displayExperience, displayProjects, FALLBACK_CONTACT }) => {
    const name = BIO?.name || 'Abdur Rahman Rafi';
    const role = activeProfile?.role || BIO?.role || '';
    const address = BIO?.address || BIO?.location || CONTACT?.address || '';
    const phone = CONTACT?.phone || CONTACT?.contactNo || FALLBACK_CONTACT?.phone || '';
    const email = CONTACT?.email || '';
    const linkedin = CONTACT?.linkedin || '';
    const github = CONTACT?.github || '';

    const fmtUrl = (url) => url ? url.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';
    const toUrl = (url) => {
        if (!url || url === '#') return url;
        const t = url.trim();
        return (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('mailto:')) ? t : `https://${t}`;
    };

    const skillRows = displaySkills.map(sg =>
        `<tr><td class="skill-label">${sg.category}:</td><td class="skill-val">${sg.items.join(', ')}</td></tr>`
    ).join('');

    const expBlocks = displayExperience.map(exp => `
        <div class="exp-block">
            <div class="exp-header">
                <span class="exp-role">${exp.role}</span>
                <span class="exp-dur">${exp.duration}</span>
            </div>
            <div class="exp-company">${exp.company}</div>
            <ul class="bullets">
                ${(exp.description || []).map(d => `<li>${d}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    const projBlocks = displayProjects.map(p => {
        const linkUrl = p.link && p.link !== '#' ? toUrl(p.link) : '';
        const linkDisplay = linkUrl ? fmtUrl(linkUrl) : '';
        return `
        <div class="proj-block">
            <div class="proj-header">
                <div class="proj-left">
                    <span class="proj-title">${p.title}</span>
                    ${linkDisplay ? `<a href="${linkUrl}" class="proj-link">${linkDisplay}</a>` : ''}
                </div>
                <span class="proj-tech">${(p.tech || []).slice(0, 4).join(' • ')}</span>
            </div>
            <p class="proj-desc">${p.description}</p>
        </div>`;
    }).join('');

    const eduRows = (EDUCATION || []).map(edu => `
        <div class="edu-row">
            <div><span class="edu-degree">${edu.degree}</span> <span class="edu-inst">— ${edu.institution}</span>${edu.description ? ` <span class="edu-note">(${edu.description})</span>` : ''}</div>
            <span class="edu-dur">${edu.duration}</span>
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${name} – CV</title>
<style>
  /* ── Page Setup ── */
  @page {
    size: A4 portrait;
    margin: 10mm 12mm 10mm 12mm;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 210mm;
    max-width: 210mm;
    font-family: Georgia, Cambria, "Times New Roman", Times, serif;
    font-size: 10.5pt;
    color: #111;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { padding: 0; }

  /* ── Header ── */
  header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 5pt; margin-bottom: 5pt; }
  h1.cv-name { font-size: 20pt; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; color: #0a0a0a; margin-bottom: 2pt; }
  p.cv-role { font-size: 9.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #1e3a8a; margin-bottom: 4pt; font-family: Arial, Helvetica, sans-serif; }
  .contact-line { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #444; display: flex; flex-wrap: wrap; justify-content: center; gap: 2pt 6pt; line-height: 1.4; }
  .contact-line a { color: #1e3a8a; text-decoration: none; }
  .sep { color: #888; }

  /* ── Section ── */
  section { margin-bottom: 6pt; break-inside: avoid; }
  h2.sec-head {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #0a0a0a;
    border-bottom: 1px solid #9ca3af;
    padding-bottom: 1pt;
    margin-bottom: 3pt;
  }

  /* ── Summary ── */
  p.summary { font-size: 10pt; color: #333; line-height: 1.4; text-align: justify; }

  /* ── Skills ── */
  table.skills { width: 100%; border-collapse: collapse; }
  td.skill-label { font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 9.5pt; color: #0a0a0a; white-space: nowrap; padding-right: 6pt; padding-bottom: 1.5pt; vertical-align: top; width: 128pt; }
  td.skill-val { font-size: 9.5pt; color: #333; line-height: 1.35; padding-bottom: 1.5pt; vertical-align: top; }

  /* ── Experience ── */
  .exp-block { margin-bottom: 5pt; break-inside: avoid; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
  .exp-role { font-weight: 700; font-size: 10.5pt; color: #0a0a0a; }
  .exp-dur { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #555; white-space: nowrap; }
  .exp-company { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; font-weight: 600; color: #1e3a8a; font-style: italic; margin-bottom: 2pt; }
  ul.bullets { margin-left: 13pt; }
  ul.bullets li { font-size: 9.5pt; color: #333; line-height: 1.35; margin-bottom: 1pt; }

  /* ── Projects ── */
  .proj-block { margin-bottom: 5pt; break-inside: avoid; }
  .proj-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 1pt; }
  .proj-left { display: flex; align-items: baseline; gap: 5pt; flex-wrap: wrap; }
  .proj-title { font-weight: 700; font-size: 10.5pt; color: #0a0a0a; }
  .proj-link { font-family: "Courier New", Courier, monospace; font-size: 8.5pt; color: #1e3a8a; text-decoration: none; }
  .proj-tech { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #555; white-space: nowrap; }
  .proj-desc { font-size: 9.5pt; color: #333; line-height: 1.35; }

  /* ── Education ── */
  .edu-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3pt; break-inside: avoid; font-size: 10pt; }
  .edu-degree { font-weight: 700; color: #0a0a0a; }
  .edu-inst { color: #333; }
  .edu-note { color: #666; font-style: italic; font-size: 9pt; }
  .edu-dur { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #555; white-space: nowrap; margin-left: 8pt; flex-shrink: 0; }

  /* ── Print: hide everything except the CV ── */
  @media screen {
    body { background: #f1f5f9; display: flex; justify-content: center; padding: 20px 0 60px; }
    .cv-sheet {
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 12mm;
      box-shadow: 0 4px 32px rgba(0,0,0,0.18);
    }
    .print-btn {
      position: fixed; bottom: 20px; right: 20px;
      background: #2563eb; color: #fff;
      border: none; border-radius: 10px;
      padding: 12px 24px; font-size: 14px; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 16px rgba(37,99,235,0.4);
      display: flex; align-items: center; gap: 8px;
    }
    .print-btn:hover { background: #1d4ed8; }
  }
  @media print {
    body { background: #fff; padding: 0; display: block; width: auto; }
    .cv-sheet { box-shadow: none; padding: 0; width: auto; }
    .print-btn { display: none !important; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">⬇ Save as PDF</button>
<div class="cv-sheet">

<header>
  <h1 class="cv-name">${name}</h1>
  <p class="cv-role">${role}</p>
  <div class="contact-line">
    ${address ? `<span>${address}</span>` : ''}
    ${phone ? `<span class="sep">•</span><a href="tel:${phone}">${phone}</a>` : ''}
    ${email ? `<span class="sep">•</span><a href="mailto:${email}">${email}</a>` : ''}
    ${linkedin ? `<span class="sep">•</span><a href="${toUrl(linkedin)}">${fmtUrl(linkedin)}</a>` : ''}
    ${github ? `<span class="sep">•</span><a href="${toUrl(github)}">${fmtUrl(github)}</a>` : ''}
  </div>
</header>

<section>
  <h2 class="sec-head">Professional Summary</h2>
  <p class="summary">${activeProfile?.summary || BIO?.summary || ''}</p>
</section>

<section>
  <h2 class="sec-head">Technical Skills</h2>
  <table class="skills"><tbody>${skillRows}</tbody></table>
</section>

<section>
  <h2 class="sec-head">Professional Experience</h2>
  ${expBlocks}
</section>

<section>
  <h2 class="sec-head">Technical Projects</h2>
  ${projBlocks}
</section>

<section>
  <h2 class="sec-head">Education</h2>
  ${eduRows}
</section>

</div>
</body>
</html>`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
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
    const [profiles, setProfiles] = useState(DEFAULT_CV_PROFILES);
    const [activeTrack, setActiveTrack] = useState(initialTrack);
    const [isCompactMode, setIsCompactMode] = useState(true);

    useEffect(() => {
        getCvProfiles().then(fetched => {
            if (fetched && fetched.length > 0) setProfiles(fetched);
        }).catch(() => {});
    }, []);

    const activeProfile = profiles.find(p => p.id === activeTrack) || profiles[0] || DEFAULT_CV_PROFILES[0];

    // ── Filtered data ─────────────────────────────────────────────────────────
    const displayProjects = React.useMemo(() => {
        if (!PROJECTS || PROJECTS.length === 0) return [];
        if (!isCompactMode) return PROJECTS;
        const targetTitles = activeProfile?.featuredProjectTitles || [];
        const prioritized = PROJECTS.filter(p => targetTitles.includes(p.title));
        const remaining = PROJECTS.filter(p => !targetTitles.includes(p.title));
        return [...prioritized, ...remaining].slice(0, 3);
    }, [PROJECTS, activeProfile, isCompactMode]);

    const displaySkills = React.useMemo(() => {
        if (!SKILLS || SKILLS.length === 0) return [];
        if (!activeProfile?.skillsCategories || !isCompactMode) return SKILLS;
        const filtered = SKILLS.filter(cat => activeProfile.skillsCategories.includes(cat.category));
        return filtered.length > 0 ? filtered : SKILLS;
    }, [SKILLS, activeProfile, isCompactMode]);

    const displayExperience = React.useMemo(() => {
        if (!EXPERIENCE || EXPERIENCE.length === 0) return [];
        if (!isCompactMode) return EXPERIENCE;
        const targetRoles = activeProfile?.featuredExperienceRoles || [];
        const sorted = [...EXPERIENCE].sort((a, b) => {
            const ai = targetRoles.indexOf(a.role), bi = targetRoles.indexOf(b.role);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return 0;
        });
        return sorted.slice(0, 3).map(exp => ({
            ...exp,
            description: exp.description ? exp.description.slice(0, 3) : []
        }));
    }, [EXPERIENCE, activeProfile, isCompactMode]);

    // ── Open a new window and print — produces a 100% text-based A4 PDF ──────
    const openPrintWindow = () => {
        const html = buildResumeHTML({
            BIO, SKILLS, PROJECTS, CONTACT, EXPERIENCE, EDUCATION,
            activeProfile, displaySkills, displayExperience, displayProjects,
            FALLBACK_CONTACT
        });
        const win = window.open('', '_blank', 'width=900,height=700');
        if (!win) {
            alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
        // Auto-trigger print dialog after page finishes loading
        win.onload = () => {
            setTimeout(() => { win.focus(); win.print(); }, 400);
        };
    };

    // ── Print current page (for the visual preview print button) ─────────────
    const handleNativePrint = () => window.print();

    if (!BIO || !EXPERIENCE || !EDUCATION) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white text-red-600 font-bold">
                DATA LOADING ERROR: CONTENT MISSING
            </div>
        );
    }

    return createPortal(
        <div id="resume-modal-portal" className="fixed inset-0 z-[200] overflow-y-auto font-sans print:static print:bg-white print:h-auto print:overflow-visible resume-modal-wrapper bg-slate-900/80 backdrop-blur-sm">

            {/* ── Inline print CSS: hides everything except the resume preview ── */}
            <style>{`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                    body > *:not(#resume-modal-portal) { display: none !important; }
                    #root { display: none !important; }
                    html, body {
                        margin: 0 !important; padding: 0 !important;
                        background: #fff !important; color: #000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #resume-modal-portal {
                        display: block !important; position: static !important;
                        width: 100% !important; background: #fff !important;
                        margin: 0 !important; padding: 0 !important; overflow: visible !important;
                    }
                    .print\\:hidden { display: none !important; }
                    #resume-pdf-content {
                        box-shadow: none !important; border: none !important;
                        margin: 0 auto !important; width: 210mm !important;
                        max-width: 210mm !important; padding: 10mm 12mm !important;
                        box-sizing: border-box !important;
                    }
                    .page-break-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
                }
            `}</style>

            {/* Backdrop */}
            <div className="fixed inset-0 print:hidden cursor-pointer" onClick={onClose} aria-hidden="true" />

            {/* Scrollable layout */}
            <div className="relative min-h-full flex flex-col items-center py-3 sm:py-6 px-2 sm:px-4 z-10 pointer-events-none print:p-0 print:block">

                {/* ── Control Bar (hidden in print) ── */}
                <div className="print:hidden w-full max-w-[210mm] mb-3 sm:mb-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col gap-2.5 sm:gap-3">

                    {/* Track tabs + Close */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5 overflow-x-auto resume-track-tabs py-0.5 flex-1 mr-2">
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
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0" title="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Mode toggle + Download buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs flex-wrap">
                        {/* 1-Page / Full mode */}
                        <div className="flex items-center justify-center sm:justify-start gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                            <button
                                onClick={() => setIsCompactMode(true)}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${isCompactMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <CheckCircle2 size={13} /> Strict 1-Page (ATS)
                            </button>
                            <button
                                onClick={() => setIsCompactMode(false)}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${!isCompactMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Sliders size={13} /> Detailed (Full)
                            </button>
                        </div>

                        {/* Export buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* PRIMARY: opens a new clean window → browser print dialog → Save as PDF */}
                            <button
                                onClick={openPrintWindow}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-1.5 rounded-xl shadow-lg transition-all"
                                title="Download as text-based A4 PDF (ATS-safe)"
                            >
                                <Download size={14} /> Download PDF (ATS)
                            </button>

                            {/* SECONDARY: print this preview page directly */}
                            <button
                                onClick={handleNativePrint}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all"
                                title="Print this preview"
                            >
                                <FileText size={13} /> Print Preview
                            </button>
                        </div>
                    </div>

                    {/* Info tip */}
                    <p className="text-[10px] text-slate-500 text-center leading-snug">
                        💡 <strong className="text-slate-400">Download PDF (ATS)</strong> opens a clean window → choose <em>"Save as PDF"</em> in the print dialog. This produces a <strong className="text-emerald-400">100% text-based PDF</strong> that ATS scanners can fully read.
                    </p>
                </div>

                {/* ── A4 Resume Preview ── */}
                <div className="w-full overflow-x-auto flex justify-center pb-8 print:p-0 print:overflow-visible">
                    <div
                        id="resume-pdf-content"
                        onClick={e => e.stopPropagation()}
                        className={`resume-paper w-full max-w-[210mm] bg-white text-gray-900 shadow-2xl rounded-none pointer-events-auto transition-all ${
                            isCompactMode
                                ? 'p-4 sm:p-[10mm_12mm] text-[11.5px] leading-snug'
                                : 'p-6 sm:p-[14mm_16mm] text-[13px] leading-normal'
                        }`}
                        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', boxSizing: 'border-box' }}
                    >
                        {/* Header */}
                        <header className="border-b-2 border-gray-900 pb-2 mb-2.5 text-center">
                            <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight uppercase text-gray-950 mb-0.5">
                                {BIO?.name || 'Abdur Rahman Rafi'}
                            </h1>
                            <p className="text-[11px] sm:text-[12px] font-bold tracking-wider text-blue-900 uppercase mb-1.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                {activeProfile?.role || BIO?.role}
                            </p>
                            <div className="flex flex-wrap justify-center text-[10px] sm:text-[10.5px] text-gray-700 gap-x-2 gap-y-0.5 leading-tight" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                {(BIO?.address || BIO?.location || CONTACT?.address) && (
                                    <span>{BIO?.address || BIO?.location || CONTACT?.address}</span>
                                )}
                                {(() => {
                                    const phone = CONTACT?.phone || CONTACT?.contactNo || FALLBACK_CONTACT?.phone;
                                    if (!phone) return null;
                                    return <><span className="text-gray-400">•</span><a href={`tel:${phone}`} className="text-gray-900 hover:underline font-medium">{phone}</a></>;
                                })()}
                                {CONTACT?.email && <><span className="text-gray-400">•</span><a href={`mailto:${CONTACT.email}`} className="text-blue-900 hover:underline font-medium">{CONTACT.email}</a></>}
                                {CONTACT?.linkedin && <><span className="text-gray-400">•</span><a href={getValidUrl(CONTACT.linkedin)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">{formatDisplayUrl(CONTACT.linkedin) || 'linkedin.com/in/rafi1438'}</a></>}
                                {CONTACT?.github && <><span className="text-gray-400">•</span><a href={getValidUrl(CONTACT.github)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">{formatDisplayUrl(CONTACT.github) || 'github.com/Abdur-Rahman-Rafi'}</a></>}
                            </div>
                        </header>

                        {/* Professional Summary */}
                        <section className="mb-2 page-break-avoid">
                            <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                Professional Summary
                            </h2>
                            <p className="text-gray-800 text-justify text-[11px] sm:text-[11.5px] leading-snug">
                                {activeProfile?.summary || BIO?.summary}
                            </p>
                        </section>

                        {/* Technical Skills */}
                        <section className="mb-2 page-break-avoid">
                            <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                Technical Skills
                            </h2>
                            <div className="space-y-0.5 text-[11px] sm:text-[11.5px]">
                                {displaySkills.map((sg, i) => (
                                    <div key={i} className="grid grid-cols-1 sm:grid-cols-[128pt_1fr] items-baseline gap-y-0 sm:gap-y-0">
                                        <span className="font-bold text-gray-950 text-[10.5px] sm:text-[11px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{sg.category}:</span>
                                        <span className="text-gray-800 leading-snug">{sg.items.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Professional Experience */}
                        <section className="mb-2">
                            <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                Professional Experience
                            </h2>
                            <div className="space-y-1.5">
                                {displayExperience.map((exp, i) => (
                                    <div key={i} className="page-break-avoid">
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                            <h3 className="font-bold text-gray-950 text-[11px] sm:text-[11.5px]">{exp.role}</h3>
                                            <span className="text-[10px] sm:text-[10.5px] font-medium text-gray-600 whitespace-nowrap" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{exp.duration}</span>
                                        </div>
                                        <div className="text-[10px] sm:text-[10.5px] font-semibold text-blue-900 italic mb-0.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{exp.company}</div>
                                        <ul className="list-disc list-outside ml-3.5 text-[10.5px] sm:text-[11px] text-gray-800 space-y-0.5 leading-snug">
                                            {exp.description?.map((d, j) => <li key={j} className="pl-0.5">{d}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Technical Projects */}
                        <section className="mb-2">
                            <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                Technical Projects
                            </h2>
                            <div className="space-y-1.5">
                                {displayProjects.map((project, i) => (
                                    <div key={i} className="page-break-avoid">
                                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <h3 className="font-bold text-gray-950 text-[11px] sm:text-[11.5px]">{project.title}</h3>
                                                {project.link && project.link !== '#' && (
                                                    <a href={getValidUrl(project.link)} target="_blank" rel="noreferrer"
                                                        className="text-[9.5px] sm:text-[10px] text-blue-800 hover:underline"
                                                        style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                                                        {formatDisplayUrl(project.link)}
                                                    </a>
                                                )}
                                            </div>
                                            <span className="text-[10px] sm:text-[10.5px] text-gray-600 font-medium" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                                {project.tech?.slice(0, 4).join(' • ')}
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] sm:text-[11px] text-gray-800 leading-snug mt-0.5">{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="page-break-avoid mb-0">
                            <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                Education
                            </h2>
                            <div className="space-y-1">
                                {EDUCATION?.map((edu, i) => (
                                    <div key={i} className="flex justify-between items-start text-[10.5px] sm:text-[11px]">
                                        <div>
                                            <span className="font-bold text-gray-950">{edu.degree}</span>
                                            <span className="text-gray-700"> — {edu.institution}</span>
                                            {edu.description && <span className="text-gray-600 italic"> ({edu.description})</span>}
                                        </div>
                                        <span className="text-[10px] sm:text-[10.5px] font-medium text-gray-600 whitespace-nowrap ml-2" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                            {edu.duration}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Resume;
