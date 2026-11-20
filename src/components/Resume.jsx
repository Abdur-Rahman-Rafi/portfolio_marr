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
import { Download, X, CheckCircle2, Sliders, Sparkles, Printer, Lock, Star } from 'lucide-react';

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

// ─── Standalone True-Text A4 Resume HTML Generator ─────────────────────────────
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

    // 1-2 high impact points per role for strict 1-page fit
    const expBlocks = displayExperience.map(exp => `
        <div class="exp-block">
            <div class="exp-header">
                <span class="exp-role">${exp.role}</span>
                <span class="exp-dur">${exp.duration}</span>
            </div>
            <div class="exp-company">${exp.company}</div>
            <ul class="bullets">
                ${(exp.description || []).slice(0, 2).map(d => `<li>${d}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    // 1 concise line per project
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
<title> </title>
<style>
  /* ── Strict A4 Setup & Auto Header/Footer Suppression ── */
  @page {
    size: A4 portrait;
    margin: 0 !important;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 210mm;
    background: #ffffff;
    color: #0f172a;
    font-family: Georgia, Cambria, "Times New Roman", Times, serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Header ── */
  header {
    text-align: center;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 5pt;
    margin-bottom: 6pt;
  }
  h1.cv-name {
    font-size: 21pt;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #020617;
    line-height: 1.15;
    margin-bottom: 2pt;
  }
  p.cv-role {
    font-size: 10pt;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #1d4ed8;
    margin-bottom: 4pt;
    font-family: Arial, Helvetica, sans-serif;
  }
  .contact-line {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.8pt;
    color: #374151;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2pt 7pt;
    line-height: 1.35;
  }
  .contact-line a {
    color: #1d4ed8;
    text-decoration: none;
    font-weight: 500;
  }
  .sep {
    color: #9ca3af;
    font-weight: 700;
  }

  /* ── Sections ── */
  section {
    margin-bottom: 6.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  section:last-child {
    margin-bottom: 0;
  }
  h2.sec-head {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #0f172a;
    border-bottom: 1.5px solid #1e293b;
    padding-bottom: 1.5pt;
    margin-bottom: 3.5pt;
  }

  /* ── Professional Summary ── */
  p.summary {
    font-size: 9.3pt;
    color: #1f2937;
    line-height: 1.4;
    text-align: justify;
  }

  /* ── Technical Skills ── */
  table.skills {
    width: 100%;
    border-collapse: collapse;
  }
  td.skill-label {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 9.3pt;
    color: #0f172a;
    white-space: nowrap;
    padding-right: 8pt;
    padding-bottom: 1.5pt;
    vertical-align: top;
    width: 125pt;
  }
  td.skill-val {
    font-size: 9.3pt;
    color: #1f2937;
    line-height: 1.38;
    padding-bottom: 1.5pt;
    vertical-align: top;
  }

  /* ── Professional Experience ── */
  .exp-block {
    margin-bottom: 4pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .exp-block:last-child {
    margin-bottom: 0;
  }
  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
  }
  .exp-role {
    font-weight: 700;
    font-size: 9.8pt;
    color: #0f172a;
  }
  .exp-dur {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.8pt;
    font-weight: 600;
    color: #4b5563;
    white-space: nowrap;
  }
  .exp-company {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    font-weight: 600;
    color: #1d4ed8;
    font-style: italic;
    margin-bottom: 1pt;
  }
  ul.bullets {
    margin-left: 13pt;
  }
  ul.bullets li {
    font-size: 9pt;
    color: #1f2937;
    line-height: 1.36;
    margin-bottom: 1pt;
  }

  /* ── Technical Projects ── */
  .proj-block {
    margin-bottom: 3.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .proj-block:last-child {
    margin-bottom: 0;
  }
  .proj-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 1pt;
  }
  .proj-left {
    display: flex;
    align-items: baseline;
    gap: 5pt;
    flex-wrap: wrap;
  }
  .proj-title {
    font-weight: 700;
    font-size: 9.8pt;
    color: #0f172a;
  }
  .proj-link {
    font-family: "Courier New", Courier, monospace;
    font-size: 8.2pt;
    color: #1d4ed8;
    text-decoration: none;
  }
  .proj-tech {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.8pt;
    font-weight: 600;
    color: #4b5563;
    white-space: nowrap;
  }
  .proj-desc {
    font-size: 9pt;
    color: #1f2937;
    line-height: 1.35;
  }

  /* ── Education ── */
  .edu-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2pt;
    break-inside: avoid;
    page-break-inside: avoid;
    font-size: 9.3pt;
  }
  .edu-row:last-child {
    margin-bottom: 0;
  }
  .edu-degree {
    font-weight: 700;
    color: #0f172a;
  }
  .edu-inst {
    color: #374151;
  }
  .edu-note {
    color: #6b7280;
    font-style: italic;
    font-size: 8.8pt;
  }
  .edu-dur {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.8pt;
    font-weight: 600;
    color: #4b5563;
    white-space: nowrap;
    margin-left: 8pt;
    flex-shrink: 0;
  }

  /* ── Screen Preview Bar & Canvas ── */
  @media screen {
    body {
      background: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 12px 60px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .print-bar {
      width: 210mm;
      max-width: 100%;
      margin-bottom: 16px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .print-bar .tip {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.4;
    }
    .print-bar .tip strong {
      color: #38bdf8;
    }
    .print-bar-actions {
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      transition: background 0.2s;
    }
    .btn-print:hover { background: #1d4ed8; }
    .btn-close {
      background: #334155;
      color: #cbd5e1;
      border: none;
      padding: 9px 14px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-close:hover { background: #475569; color: #fff; }
    .cv-sheet {
      background: #ffffff;
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 13mm 8mm 13mm;
      box-sizing: border-box;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      border-radius: 2px;
    }
  }

  /* ── Clean Print Setup: Exact 1 Page A4 with Education Completely Visible ── */
  @media print {
    body {
      background: #ffffff !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
      width: 210mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
    }
    .print-bar {
      display: none !important;
    }
    .cv-sheet {
      box-shadow: none !important;
      border: none !important;
      margin: 0 auto !important;
      width: 210mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      padding: 10mm 13mm 8mm 13mm !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;
    }
  }
</style>
</head>
<body>

<div class="print-bar">
  <div class="tip">
    🖨️ <strong>Save as PDF:</strong> Select <strong>Destination: Save as PDF</strong>. All sections (including Education) fit strictly on 1 page with zero headers/footers.
  </div>
  <div class="print-bar-actions">
    <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
</div>

<div class="cv-sheet">
${activeProfile?.customHtml ? activeProfile.customHtml : `
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
`}
</div>

<script>
  window.addEventListener('load', function() {
    setTimeout(function() {
      window.focus();
      window.print();
    }, 350);
  });
</script>
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
    initialTrack
}) => {
    const [profiles, setProfiles] = useState(DEFAULT_CV_PROFILES);
    const [activeTrack, setActiveTrack] = useState(initialTrack || 'software');
    const [isCompactMode, setIsCompactMode] = useState(true);

    useEffect(() => {
        getCvProfiles().then(fetched => {
            if (fetched && fetched.length > 0) {
                setProfiles(fetched);
                // If initialTrack was not explicitly passed, pick the featured profile or first public profile
                if (!initialTrack) {
                    const featured = fetched.find(p => p.isFeatured && p.isPublic !== false);
                    const firstPublic = fetched.find(p => p.isPublic !== false);
                    if (featured) {
                        setActiveTrack(featured.id);
                    } else if (firstPublic) {
                        setActiveTrack(firstPublic.id);
                    }
                }
            }
        }).catch(() => {});
    }, [initialTrack]);

    // Filter profiles for visitors:
    // Only public profiles (isPublic !== false) are visible to normal visitors
    const publicProfiles = React.useMemo(() => {
        const filtered = profiles.filter(p => p.isPublic !== false);
        return filtered.length > 0 ? filtered : profiles;
    }, [profiles]);

    // Current active profile
    const activeProfile = profiles.find(p => p.id === activeTrack) || publicProfiles[0] || profiles[0] || DEFAULT_CV_PROFILES[0];
    const isLocked = activeProfile?.isPublic === false;

    // ── Filtered data ─────────────────────────────────────────────────────────
    const displayProjects = React.useMemo(() => {
        if (!PROJECTS || PROJECTS.length === 0) return [];
        if (!isCompactMode) return PROJECTS;
        // Try title-based prioritization first; fall back to any first 3 if no matches
        const targetTitles = activeProfile?.featuredProjectTitles || [];
        if (targetTitles.length > 0) {
            const prioritized = PROJECTS.filter(p => targetTitles.some(t => t.trim().toLowerCase() === (p.title || '').trim().toLowerCase()));
            const remaining = PROJECTS.filter(p => !targetTitles.some(t => t.trim().toLowerCase() === (p.title || '').trim().toLowerCase()));
            const merged = [...prioritized, ...remaining].slice(0, 3);
            if (merged.length > 0) return merged;
        }
        // Fallback: just return first 3 projects
        return PROJECTS.slice(0, 3);
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
        // Strict 1-page mode: 1-2 powerful bullet points per role
        return sorted.slice(0, 3).map(exp => ({
            ...exp,
            description: exp.description ? exp.description.slice(0, 2) : []
        }));
    }, [EXPERIENCE, activeProfile, isCompactMode]);

    // ── Open dedicated print window via Blob URL (no about:blank, 100% text A4) ─
    const openPrintWindow = () => {
        if (isLocked) {
            alert('This CV profile is locked by the administrator and cannot be exported.');
            return;
        }
        const html = buildResumeHTML({
            BIO, SKILLS, PROJECTS, CONTACT, EXPERIENCE, EDUCATION,
            activeProfile, displaySkills, displayExperience, displayProjects,
            FALLBACK_CONTACT
        });
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
            alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
        }
    };

    // ── Native print for in-page preview ──────────────────────────────────────
    const handleNativePrint = () => {
        if (isLocked) {
            alert('This CV profile is locked by the administrator.');
            return;
        }
        window.print();
    };

    if (!BIO || !EXPERIENCE || !EDUCATION) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white text-red-600 font-bold">
                DATA LOADING ERROR: CONTENT MISSING
            </div>
        );
    }

    return createPortal(
        <div id="resume-modal-portal" className="fixed inset-0 z-[200] overflow-y-auto font-sans print:static print:bg-white print:h-auto print:overflow-visible resume-modal-wrapper bg-slate-900/80 backdrop-blur-sm">

            {/* ── Inline print CSS: removes headers/footers, exact A4, no app leak ── */}
            <style>{`
                @page { 
                    size: A4 portrait; 
                    margin: 0 !important; 
                }
                @media print {
                    body > *:not(#resume-modal-portal) { display: none !important; }
                    #root { display: none !important; }
                    html, body {
                        margin: 0 !important; 
                        padding: 0 !important;
                        background: #ffffff !important; 
                        color: #000000 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #resume-modal-portal {
                        display: block !important; 
                        position: static !important;
                        width: 100% !important; 
                        background: #ffffff !important;
                        margin: 0 !important; 
                        padding: 0 !important; 
                        overflow: visible !important;
                    }
                    .print\\:hidden { display: none !important; }
                    #resume-pdf-content {
                        box-shadow: none !important; 
                        border: none !important;
                        margin: 0 auto !important; 
                        width: 210mm !important;
                        max-width: 210mm !important; 
                        height: 297mm !important;
                        max-height: 297mm !important;
                        padding: 10mm 13mm 8mm 13mm !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        break-after: avoid !important;
                        break-inside: avoid !important;
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
                                {publicProfiles.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setActiveTrack(p.id)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            activeTrack === p.id
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    >
                                        {p.isFeatured && <Star size={11} className="text-yellow-300 fill-yellow-300" />}
                                        <span>{p.badge || p.name}</span>
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
                            {/* PRIMARY: opens new window with Blob URL → 100% text A4 PDF without timing/URLs */}
                            <button
                                onClick={openPrintWindow}
                                disabled={isLocked}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded-xl shadow-lg transition-all disabled:opacity-40"
                                title="Download as text-based A4 PDF (ATS-safe, zero headers/footers)"
                            >
                                <Download size={14} /> Download PDF (ATS)
                            </button>

                            {/* SECONDARY: print preview */}
                            <button
                                onClick={handleNativePrint}
                                disabled={isLocked}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all disabled:opacity-40"
                                title="Print this preview"
                            >
                                <Printer size={13} /> Print Preview
                            </button>
                        </div>
                    </div>

                    {/* Helpful Tip */}
                    <p className="text-[10px] text-slate-400 text-center leading-snug">
                        ✨ <strong className="text-slate-300">Clean 1-Page A4:</strong> Calibrated with concise 1–2 bullet points to keep Education & all sections 100% visible on 1 page.
                    </p>
                </div>

                {/* ── Content View: Locked Screen vs Active Resume Document ── */}
                <div className="w-full overflow-x-auto flex justify-center pb-8 print:p-0 print:overflow-visible">
                    {isLocked ? (
                        <div className="p-8 sm:p-12 text-center bg-white border border-slate-200 shadow-2xl rounded-none w-full max-w-[210mm] my-4 isolate">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4">
                                <Lock size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Restricted CV Track</h3>
                            <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                                This resume track (<strong>{activeProfile?.name}</strong>) is currently locked by the administrator. Only public featured CVs are available for download.
                            </p>
                            <button
                                onClick={() => {
                                    const featured = profiles.find(p => p.isFeatured && p.isPublic !== false) || publicProfiles[0];
                                    if (featured) setActiveTrack(featured.id);
                                }}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2"
                            >
                                <Star size={14} className="fill-yellow-300 text-yellow-300" />
                                Switch to Featured Public CV ({profiles.find(p => p.isFeatured)?.badge || 'Featured'})
                            </button>
                        </div>
                    ) : (
                        <div
                            id="resume-pdf-content"
                            onClick={e => e.stopPropagation()}
                            className={`resume-paper w-full max-w-[210mm] bg-white text-gray-900 shadow-2xl rounded-none pointer-events-auto transition-all ${
                                isCompactMode
                                    ? 'p-4 sm:p-[10mm_13mm] text-[10.5px] leading-normal'
                                    : 'p-6 sm:p-[14mm_16mm] text-[12px] leading-normal'
                            }`}
                            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', boxSizing: 'border-box' }}
                        >
                            {/* Render Word Editor Custom HTML if present, or Default Structured Sections */}
                            {activeProfile?.customHtml ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: activeProfile.customHtml }}
                                    className="w-full"
                                />
                            ) : (
                                <>
                                    {/* Header */}
                                    <header className="border-b-2 border-gray-900 pb-2 mb-2 text-center">
                                        <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight uppercase text-gray-950 mb-0.5 leading-tight">
                                            {BIO?.name || 'Abdur Rahman Rafi'}
                                        </h1>
                                        <p className="text-[11px] sm:text-[11.5px] font-bold tracking-wider text-blue-900 uppercase mb-1.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                            {activeProfile?.role || BIO?.role}
                                        </p>
                                        <div className="flex flex-wrap justify-center text-[10px] sm:text-[10.5px] text-gray-700 gap-x-2 gap-y-0.5 leading-tight" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                            {(BIO?.address || BIO?.location || CONTACT?.address) && (
                                                <span>{BIO?.address || BIO?.location || CONTACT?.address}</span>
                                            )}
                                            {(() => {
                                                const phone = CONTACT?.phone || CONTACT?.contactNo || FALLBACK_CONTACT?.phone;
                                                if (!phone) return null;
                                                return <><span className="text-gray-400 font-bold">•</span><a href={`tel:${phone}`} className="text-gray-900 hover:underline font-medium">{phone}</a></>;
                                            })()}
                                            {CONTACT?.email && <><span className="text-gray-400 font-bold">•</span><a href={`mailto:${CONTACT.email}`} className="text-blue-900 hover:underline font-medium">{CONTACT.email}</a></>}
                                            {CONTACT?.linkedin && <><span className="text-gray-400 font-bold">•</span><a href={getValidUrl(CONTACT.linkedin)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">{formatDisplayUrl(CONTACT.linkedin) || 'linkedin.com/in/rafi1438'}</a></>}
                                            {CONTACT?.github && <><span className="text-gray-400 font-bold">•</span><a href={getValidUrl(CONTACT.github)} target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline font-medium">{formatDisplayUrl(CONTACT.github) || 'github.com/Abdur-Rahman-Rafi'}</a></>}
                                        </div>
                                    </header>

                                    {/* Professional Summary */}
                                    <section className="mb-2 page-break-avoid">
                                        <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                            Professional Summary
                                        </h2>
                                        <p className="text-gray-800 text-justify text-[10.5px] sm:text-[11px] leading-snug">
                                            {activeProfile?.summary || BIO?.summary}
                                        </p>
                                    </section>

                                    {/* Technical Skills */}
                                    <section className="mb-2 page-break-avoid">
                                        <h2 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-400 pb-0.5 mb-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                            Technical Skills
                                        </h2>
                                        <div className="space-y-0.5 text-[10.5px] sm:text-[11px]">
                                            {displaySkills.map((sg, i) => (
                                                <div key={i} className="grid grid-cols-1 sm:grid-cols-[130pt_1fr] items-baseline gap-y-0.5 sm:gap-y-0">
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
                                                    <ul className="list-disc list-outside ml-3.5 text-[10px] sm:text-[10.5px] text-gray-800 space-y-0.5 leading-snug">
                                                        {(exp.description || []).slice(0, 2).map((d, j) => <li key={j} className="pl-0.5">{d}</li>)}
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
                                                    <p className="text-[10px] sm:text-[10.5px] text-gray-800 leading-snug mt-0.5 line-clamp-2">{project.description}</p>
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
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Resume;
