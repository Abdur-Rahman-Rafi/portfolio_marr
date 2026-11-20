import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, List, ListOrdered, Link2, Unlink, Minus,
    Undo2, Redo2, Eraser, Eye, Lock, Unlock, Star, Sparkles, Download,
    Save, RefreshCw, Palette, Highlighter, Type, Columns, Maximize2,
    FileText, Plus, Trash2, CheckCircle2, AlertTriangle, Layers, Info
} from 'lucide-react';

const FONT_FAMILIES = [
    { name: 'Georgia (Serif)', value: 'Georgia, Cambria, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Arial (Sans-serif)', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Calibri (Sans-serif)', value: 'Calibri, sans-serif' },
    { name: 'Garamond (Serif)', value: 'Garamond, serif' },
    { name: 'Inter (Modern)', value: 'Inter, sans-serif' },
    { name: 'Courier New (Mono)', value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = [
    { label: '8 pt', value: '1' },
    { label: '9 pt', value: '2' },
    { label: '10 pt (Standard)', value: '3' },
    { label: '11 pt (Headings)', value: '4' },
    { label: '14 pt (Subtitles)', value: '5' },
    { label: '18 pt (Titles)', value: '6' },
    { label: '24 pt (Name)', value: '7' },
];

const COLOR_PALETTE = [
    { label: 'Black', value: '#020617' },
    { label: 'Slate Gray', value: '#334155' },
    { label: 'Navy Blue', value: '#1e3a8a' },
    { label: 'Royal Blue', value: '#2563eb' },
    { label: 'Emerald Green', value: '#059669' },
    { label: 'Wine Red', value: '#991b1b' },
    { label: 'Purple', value: '#7c3aed' },
];

const HIGHLIGHT_PALETTE = [
    { label: 'None', value: 'transparent' },
    { label: 'Yellow', value: '#fef08a' },
    { label: 'Soft Green', value: '#bbf7d0' },
    { label: 'Soft Cyan', value: '#a5f3fc' },
    { label: 'Soft Pink', value: '#fbcfe8' },
];

// Helper to generate initial HTML from structured data if customHtml is empty
export const generateTrackHtml = ({ profile, bio, contact, skills, experience, projects, education }) => {
    const name = bio?.name || 'Abdur Rahman Rafi';
    const role = profile?.role || bio?.role || 'Software Developer';
    const address = bio?.address || bio?.location || contact?.address || 'Dhaka, Bangladesh';
    const phone = contact?.phone || contact?.contactNo || '+880 1700-000000';
    const email = contact?.email || 'arafi223437@bscse.uiu.ac.bd';
    const linkedin = contact?.linkedin ? contact.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : 'linkedin.com/in/rafi1438';
    const github = contact?.github ? contact.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : 'github.com/Abdur-Rahman-Rafi';

    const targetRoles = profile?.featuredExperienceRoles || [];
    const sortedExp = [...(experience || [])].sort((a, b) => {
        const ai = targetRoles.indexOf(a.role), bi = targetRoles.indexOf(b.role);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return 0;
    }).slice(0, 3);

    const targetProjects = profile?.featuredProjectTitles || [];
    const sortedProjects = [...(projects || [])].sort((a, b) => {
        const ai = targetProjects.indexOf(a.title), bi = targetProjects.indexOf(b.title);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return 0;
    }).slice(0, 3);

    const targetCategories = profile?.skillsCategories || [];
    const filteredSkills = (skills || []).filter(s => targetCategories.length === 0 || targetCategories.includes(s.category));

    return `<header style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 5pt; margin-bottom: 6pt;">
  <h1 style="font-size: 21pt; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; color: #020617; line-height: 1.15; margin: 0 0 2pt 0;">${name}</h1>
  <p style="font-size: 10pt; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #1d4ed8; font-family: Arial, sans-serif; margin: 0 0 4pt 0;">${role}</p>
  <div style="font-family: Arial, sans-serif; font-size: 8.8pt; color: #374151; display: flex; flex-wrap: wrap; justify-content: center; gap: 2pt 7pt; line-height: 1.35;">
    <span>${address}</span>
    <span style="color: #9ca3af; font-weight: bold;">•</span>
    <a href="tel:${phone}" style="color: #1d4ed8; text-decoration: none; font-weight: 500;">${phone}</a>
    <span style="color: #9ca3af; font-weight: bold;">•</span>
    <a href="mailto:${email}" style="color: #1d4ed8; text-decoration: none; font-weight: 500;">${email}</a>
    <span style="color: #9ca3af; font-weight: bold;">•</span>
    <span style="color: #1d4ed8; font-weight: 500;">${linkedin}</span>
    <span style="color: #9ca3af; font-weight: bold;">•</span>
    <span style="color: #1d4ed8; font-weight: 500;">${github}</span>
  </div>
</header>

<section style="margin-bottom: 6.5pt;">
  <h2 style="font-family: Arial, sans-serif; font-size: 9.8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; border-bottom: 1.5px solid #1e293b; padding-bottom: 1.5pt; margin: 0 0 3.5pt 0;">Professional Summary</h2>
  <p style="font-size: 9.3pt; color: #1f2937; line-height: 1.4; text-align: justify; margin: 0;">${profile?.summary || bio?.summary || ''}</p>
</section>

<section style="margin-bottom: 6.5pt;">
  <h2 style="font-family: Arial, sans-serif; font-size: 9.8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; border-bottom: 1.5px solid #1e293b; padding-bottom: 1.5pt; margin: 0 0 3.5pt 0;">Technical Skills</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      ${filteredSkills.map(s => `<tr>
        <td style="font-family: Arial, sans-serif; font-weight: 700; font-size: 9.3pt; color: #0f172a; white-space: nowrap; padding-right: 8pt; padding-bottom: 1.5pt; vertical-align: top; width: 125pt;">${s.category}:</td>
        <td style="font-size: 9.3pt; color: #1f2937; line-height: 1.38; padding-bottom: 1.5pt; vertical-align: top;">${s.items?.join(', ')}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</section>

<section style="margin-bottom: 6.5pt;">
  <h2 style="font-family: Arial, sans-serif; font-size: 9.8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; border-bottom: 1.5px solid #1e293b; padding-bottom: 1.5pt; margin: 0 0 3.5pt 0;">Professional Experience</h2>
  ${sortedExp.map(exp => `<div style="margin-bottom: 4pt;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
      <span style="font-weight: 700; font-size: 9.8pt; color: #0f172a;">${exp.role}</span>
      <span style="font-family: Arial, sans-serif; font-size: 8.8pt; font-weight: 600; color: #4b5563;">${exp.duration}</span>
    </div>
    <div style="font-family: Arial, sans-serif; font-size: 9pt; font-weight: 600; color: #1d4ed8; font-style: italic; margin-bottom: 1pt;">${exp.company}</div>
    <ul style="margin: 0 0 0 13pt; padding: 0;">
      ${(exp.description || []).slice(0, 2).map(d => `<li style="font-size: 9pt; color: #1f2937; line-height: 1.36; margin-bottom: 1pt;">${d}</li>`).join('')}
    </ul>
  </div>`).join('')}
</section>

<section style="margin-bottom: 6.5pt;">
  <h2 style="font-family: Arial, sans-serif; font-size: 9.8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; border-bottom: 1.5px solid #1e293b; padding-bottom: 1.5pt; margin: 0 0 3.5pt 0;">Technical Projects</h2>
  ${sortedProjects.map(p => `<div style="margin-bottom: 3.5pt;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 1pt;">
      <div style="display: flex; align-items: baseline; gap: 5pt; flex-wrap: wrap;">
        <span style="font-weight: 700; font-size: 9.8pt; color: #0f172a;">${p.title}</span>
        ${p.link && p.link !== '#' ? `<span style="font-family: 'Courier New', monospace; font-size: 8.2pt; color: #1d4ed8;">(${p.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')})</span>` : ''}
      </div>
      <span style="font-family: Arial, sans-serif; font-size: 8.8pt; font-weight: 600; color: #4b5563;">${(p.tech || []).slice(0, 4).join(' • ')}</span>
    </div>
    <p style="font-size: 9pt; color: #1f2937; line-height: 1.35; margin: 0;">${p.description}</p>
  </div>`).join('')}
</section>

<section style="margin-bottom: 0;">
  <h2 style="font-family: Arial, sans-serif; font-size: 9.8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; border-bottom: 1.5px solid #1e293b; padding-bottom: 1.5pt; margin: 0 0 3.5pt 0;">Education</h2>
  ${(education || []).map(edu => `<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2pt; font-size: 9.3pt;">
    <div>
      <span style="font-weight: 700; color: #0f172a;">${edu.degree}</span>
      <span style="color: #374151;"> — ${edu.institution}</span>
      ${edu.description ? `<span style="color: #6b7280; font-style: italic; font-size: 8.8pt;"> (${edu.description})</span>` : ''}
    </div>
    <span style="font-family: Arial, sans-serif; font-size: 8.8pt; font-weight: 600; color: #4b5563; white-space: nowrap; margin-left: 8pt;">${edu.duration}</span>
  </div>`).join('')}
</section>`;
};

const ResumeWordEditor = ({
    profiles = [],
    onProfilesChange,
    onSaveProfiles,
    bio,
    contact,
    skills,
    experience,
    projects,
    education,
    saving = false,
    showToast
}) => {
    const [activeTrackId, setActiveTrackId] = useState(profiles[0]?.id || 'software');
    const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
    const [ribbonTab, setRibbonTab] = useState('home'); // 'home' | 'insert' | 'view'
    const [currentHtml, setCurrentHtml] = useState('');
    const [fontColor, setFontColor] = useState('#020617');
    const [highlightColor, setHighlightColor] = useState('transparent');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const editorRef = useRef(null);

    // Current active profile
    const activeProfile = profiles.find(p => p.id === activeTrackId) || profiles[0];

    // Load content when active track changes or projects update
    // Always regenerate from live data so projects are always current.
    // customHtml is preserved via onSaveProfiles only when admin explicitly saves.
    useEffect(() => {
        if (!activeProfile) return;
        // If projects are loaded, always regenerate fresh HTML from live data
        // so the editor reflects the actual current project list.
        const hasFreshData = projects && projects.length > 0;
        const initial = hasFreshData
            ? generateTrackHtml({ profile: activeProfile, bio, contact, skills, experience, projects, education })
            : (activeProfile.customHtml || generateTrackHtml({ profile: activeProfile, bio, contact, skills, experience, projects, education }));
        setCurrentHtml(initial);
        if (editorRef.current) {
            editorRef.current.innerHTML = initial;
        }
        setHasUnsavedChanges(false);
    }, [activeTrackId, activeProfile?.id, projects?.length]);

    // Execute rich text formatting command
    const executeCommand = (command, value = null) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleEditorInput();
    };

    // Keep state updated on typing
    const handleEditorInput = () => {
        if (!editorRef.current) return;
        const updatedHtml = editorRef.current.innerHTML;
        setCurrentHtml(updatedHtml);
        setHasUnsavedChanges(true);

        // Update profile in parent state
        onProfilesChange(prev => prev.map(p => {
            if (p.id === activeTrackId) {
                return { ...p, customHtml: updatedHtml };
            }
            return p;
        }));
    };

    // Toggle Public / Locked
    const handleToggleLock = (trackId) => {
        onProfilesChange(prev => prev.map(p => {
            if (p.id === trackId) {
                const nextPublic = p.isPublic === false ? true : false;
                // If locking the featured track, unfeature it
                const nextFeatured = nextPublic === false ? false : p.isFeatured;
                return { ...p, isPublic: nextPublic, isFeatured: nextFeatured };
            }
            return p;
        }));
        setHasUnsavedChanges(true);
        const p = profiles.find(x => x.id === trackId);
        showToast && showToast(`Track "${p?.name}" is now ${p?.isPublic === false ? 'Public 🌐' : 'Locked 🔒'}`);
    };

    // Set Featured CV (only 1 can be featured)
    const handleSetFeatured = (trackId) => {
        onProfilesChange(prev => prev.map(p => ({
            ...p,
            isFeatured: p.id === trackId,
            // Featured track must always be public
            isPublic: p.id === trackId ? true : p.isPublic
        })));
        setHasUnsavedChanges(true);
        const p = profiles.find(x => x.id === trackId);
        showToast && showToast(`"${p?.name}" is now the Featured Public CV ⭐`);
    };

    // Reset current track layout to default template
    const handleResetLayout = () => {
        if (!window.confirm(`Reset "${activeProfile?.name}" to the default calibrated layout? Your custom edits for this track will be restored to default.`)) return;
        const fresh = generateTrackHtml({
            profile: activeProfile,
            bio,
            contact,
            skills,
            experience,
            projects,
            education
        });
        setCurrentHtml(fresh);
        if (editorRef.current) {
            editorRef.current.innerHTML = fresh;
        }
        onProfilesChange(prev => prev.map(p => p.id === activeTrackId ? { ...p, customHtml: fresh } : p));
        setHasUnsavedChanges(true);
        showToast && showToast('Layout reset to default 1-page template.');
    };

    // Insert templates
    const insertTemplate = (type) => {
        let snippet = '';
        if (type === 'heading') {
            const headingTitle = prompt('Enter Section Title:', 'NEW SECTION');
            if (!headingTitle) return;
            snippet = `<section style="margin-bottom: 6.5pt;"><h2 style="font-family: Arial, sans-serif; font-size: 9.8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; border-bottom: 1.5px solid #1e293b; padding-bottom: 1.5pt; margin: 0 0 3.5pt 0;">${headingTitle}</h2><p style="font-size: 9.3pt; color: #1f2937; line-height: 1.4; margin: 0;">Add your section details here...</p></section>`;
        } else if (type === 'experience') {
            snippet = `<div style="margin-bottom: 4pt;"><div style="display: flex; justify-content: space-between; align-items: baseline;"><span style="font-weight: 700; font-size: 9.8pt; color: #0f172a;">Software Engineer</span><span style="font-family: Arial, sans-serif; font-size: 8.8pt; font-weight: 600; color: #4b5563;">2024 – Present</span></div><div style="font-family: Arial, sans-serif; font-size: 9pt; font-weight: 600; color: #1d4ed8; font-style: italic; margin-bottom: 1pt;">Company Name</div><ul style="margin: 0 0 0 13pt; padding: 0;"><li style="font-size: 9pt; color: #1f2937; line-height: 1.36; margin-bottom: 1pt;">Key achievement with concrete metrics.</li><li style="font-size: 9pt; color: #1f2937; line-height: 1.36; margin-bottom: 1pt;">Implemented scalable solution using modern architecture.</li></ul></div>`;
        } else if (type === 'project') {
            snippet = `<div style="margin-bottom: 3.5pt;"><div style="display: flex; justify-content: space-between; align-items: baseline;"><div style="display: flex; align-items: baseline; gap: 5pt;"><span style="font-weight: 700; font-size: 9.8pt; color: #0f172a;">Project Name</span><span style="font-family: 'Courier New', monospace; font-size: 8.2pt; color: #1d4ed8;">(github.com/project)</span></div><span style="font-family: Arial, sans-serif; font-size: 8.8pt; font-weight: 600; color: #4b5563;">React • Node.js • Cloud</span></div><p style="font-size: 9pt; color: #1f2937; line-height: 1.35; margin: 0;">Engineered full-stack system supporting automated workflows and secure data operations.</p></div>`;
        } else if (type === 'education') {
            snippet = `<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2pt; font-size: 9.3pt;"><div><span style="font-weight: 700; color: #0f172a;">Degree Name</span><span style="color: #374151;"> — University Name</span><span style="color: #6b7280; font-style: italic; font-size: 8.8pt;"> (CGPA / Distinction)</span></div><span style="font-family: Arial, sans-serif; font-size: 8.8pt; font-weight: 600; color: #4b5563; white-space: nowrap; margin-left: 8pt;">2020 – 2024</span></div>`;
        } else if (type === 'divider') {
            snippet = `<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 5pt 0;" />`;
        }

        if (snippet && editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertHTML', false, snippet);
            handleEditorInput();
        }
    };

    const handleInsertLink = () => {
        const url = prompt('Enter Link URL (e.g. https://github.com/name):', 'https://');
        if (url) {
            executeCommand('createLink', url);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            
            {/* ── TOP BAR: Track Selector & Lock / Featured Status ── */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
                        <FileText size={14} className="text-blue-400" /> Active CV:
                    </span>
                    {profiles.map(p => {
                        const isSelected = p.id === activeTrackId;
                        const isPublic = p.isPublic !== false;
                        const isFeatured = !!p.isFeatured;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setActiveTrackId(p.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                {isFeatured && <Star size={12} className="text-yellow-300 fill-yellow-300" />}
                                <span>{p.badge || p.name}</span>
                                {isPublic ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Public (Visible to Visitors)" />
                                ) : (
                                    <Lock size={11} className="text-amber-400" title="Locked (Hidden from Visitors)" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Visibility Controls for Active Track */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                    {/* Public / Locked Toggle */}
                    <button
                        type="button"
                        onClick={() => handleToggleLock(activeTrackId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            activeProfile?.isPublic !== false
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Toggle visibility on website frontend"
                    >
                        {activeProfile?.isPublic !== false ? (
                            <><Unlock size={13} className="text-emerald-400" /> 🌐 Public to Visitors</>
                        ) : (
                            <><Lock size={13} className="text-amber-400" /> 🔒 Locked (Private)</>
                        )}
                    </button>

                    {/* Featured CV Toggle */}
                    <button
                        type="button"
                        onClick={() => handleSetFeatured(activeTrackId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            activeProfile?.isFeatured
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-yellow-300 hover:border-slate-600'
                        }`}
                        title="Set this as the primary default CV for all website visitors"
                    >
                        <Star size={13} className={activeProfile?.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''} />
                        {activeProfile?.isFeatured ? '⭐ Primary Featured CV' : 'Set as Featured'}
                    </button>

                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={onSaveProfiles}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                        Save &amp; Publish
                    </button>
                </div>
            </div>

            {/* ── MS WORD RIBBON TOOLBAR ── */}
            <div className="bg-slate-800/90 border-b border-slate-700 text-slate-200">
                {/* Ribbon Tabs */}
                <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-700/60 bg-slate-900/60 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setRibbonTab('home')}
                        className={`px-3 py-1 rounded-t-lg transition-all ${
                            ribbonTab === 'home'
                                ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Home (Typography &amp; Paragraph)
                    </button>
                    <button
                        type="button"
                        onClick={() => setRibbonTab('insert')}
                        className={`px-3 py-1 rounded-t-lg transition-all ${
                            ribbonTab === 'insert'
                                ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Insert (Sections &amp; Links)
                    </button>
                    <button
                        type="button"
                        onClick={() => setRibbonTab('view')}
                        className={`px-3 py-1 rounded-t-lg transition-all ${
                            ribbonTab === 'view'
                                ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        View &amp; Layout Tools
                    </button>
                </div>

                {/* Tab 1: HOME (Font, Size, Style, Alignment) */}
                {ribbonTab === 'home' && (
                    <div className="p-2.5 flex flex-wrap items-center gap-2 text-xs">
                        {/* Undo / Redo */}
                        <div className="flex items-center gap-0.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700/70">
                            <button type="button" onClick={() => executeCommand('undo')} title="Undo (Ctrl+Z)" className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white">
                                <Undo2 size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('redo')} title="Redo (Ctrl+Y)" className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white">
                                <Redo2 size={14} />
                            </button>
                        </div>

                        {/* Font Family */}
                        <select
                            onChange={(e) => executeCommand('fontName', e.target.value)}
                            className="bg-slate-900/90 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                            defaultValue="Georgia, Cambria, serif"
                        >
                            {FONT_FAMILIES.map((f, i) => (
                                <option key={i} value={f.value}>{f.name}</option>
                            ))}
                        </select>

                        {/* Font Size */}
                        <select
                            onChange={(e) => executeCommand('fontSize', e.target.value)}
                            className="bg-slate-900/90 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                            defaultValue="3"
                        >
                            {FONT_SIZES.map((s, i) => (
                                <option key={i} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        {/* Bold, Italic, Underline, Strikethrough */}
                        <div className="flex items-center gap-0.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700/70">
                            <button type="button" onClick={() => executeCommand('bold')} title="Bold (Ctrl+B)" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white font-bold">
                                <Bold size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('italic')} title="Italic (Ctrl+I)" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <Italic size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('underline')} title="Underline (Ctrl+U)" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <Underline size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('strikeThrough')} title="Strikethrough" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <Strikethrough size={14} />
                            </button>
                        </div>

                        {/* Text Color Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
                                className="flex items-center gap-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-lg text-slate-200"
                                title="Text Color"
                            >
                                <span className="font-extrabold text-sm" style={{ color: fontColor }}>A</span>
                                <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: fontColor }} />
                            </button>
                            {showColorPicker && (
                                <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col gap-1 w-32">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Text Color</span>
                                    {COLOR_PALETTE.map((c, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setFontColor(c.value);
                                                executeCommand('foreColor', c.value);
                                                setShowColorPicker(false);
                                            }}
                                            className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded text-xs text-left"
                                        >
                                            <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" style={{ backgroundColor: c.value }} />
                                            <span className="text-slate-300">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Highlight Color Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
                                className="flex items-center gap-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-lg text-slate-200"
                                title="Text Highlight"
                            >
                                <Highlighter size={13} className="text-yellow-400" />
                            </button>
                            {showHighlightPicker && (
                                <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col gap-1 w-32">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Highlight</span>
                                    {HIGHLIGHT_PALETTE.map((c, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setHighlightColor(c.value);
                                                executeCommand('hiliteColor', c.value);
                                                setShowHighlightPicker(false);
                                            }}
                                            className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded text-xs text-left"
                                        >
                                            <span className="w-3.5 h-3.5 rounded-sm border border-slate-600 shrink-0" style={{ backgroundColor: c.value }} />
                                            <span className="text-slate-300">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Alignment */}
                        <div className="flex items-center gap-0.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700/70">
                            <button type="button" onClick={() => executeCommand('justifyLeft')} title="Align Left" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <AlignLeft size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('justifyCenter')} title="Align Center" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <AlignCenter size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('justifyRight')} title="Align Right" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <AlignRight size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('justifyFull')} title="Justify" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <AlignJustify size={14} />
                            </button>
                        </div>

                        {/* Lists */}
                        <div className="flex items-center gap-0.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700/70">
                            <button type="button" onClick={() => executeCommand('insertUnorderedList')} title="Bullet List" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <List size={14} />
                            </button>
                            <button type="button" onClick={() => executeCommand('insertOrderedList')} title="Numbered List" className="p-1.5 hover:bg-slate-700 rounded text-slate-200 hover:text-white">
                                <ListOrdered size={14} />
                            </button>
                        </div>

                        {/* Clear Format */}
                        <button
                            type="button"
                            onClick={() => executeCommand('removeFormat')}
                            title="Clear Formatting"
                            className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
                        >
                            <Eraser size={14} />
                        </button>
                    </div>
                )}

                {/* Tab 2: INSERT (Blocks & Templates) */}
                {ribbonTab === 'insert' && (
                    <div className="p-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <button
                            type="button"
                            onClick={handleInsertLink}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200"
                        >
                            <Link2 size={13} className="text-blue-400" /> Insert Link
                        </button>
                        <button
                            type="button"
                            onClick={() => executeCommand('unlink')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
                        >
                            <Unlink size={13} /> Unlink
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('divider')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
                        >
                            <Minus size={13} /> Divider Line
                        </button>

                        <div className="h-4 w-px bg-slate-700 mx-1" />

                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Insert Pre-styled Block:</span>
                        <button
                            type="button"
                            onClick={() => insertTemplate('heading')}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg font-medium"
                        >
                            + Section Heading
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('experience')}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg font-medium"
                        >
                            + Job Entry (1-2 pts)
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('project')}
                            className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 rounded-lg font-medium"
                        >
                            + Project Entry
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('education')}
                            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg font-medium"
                        >
                            + Education Entry
                        </button>
                    </div>
                )}

                {/* Tab 3: VIEW & LAYOUT */}
                {ribbonTab === 'view' && (
                    <div className="p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
                            <button
                                type="button"
                                onClick={() => setViewMode('split')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                                    viewMode === 'split' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Columns size={13} /> Split View (Editor + Live Output)
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('editor')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                                    viewMode === 'editor' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Type size={13} /> Full Word Editor
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('preview')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                                    viewMode === 'preview' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Eye size={13} /> Full A4 Print Preview
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleResetLayout}
                                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs"
                                title="Reset this track to default verified 1-page template"
                            >
                                <RefreshCw size={12} /> Reset to Default Template
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── WORKSPACE: SPLIT-SCREEN / EDITOR / LIVE PREVIEW ── */}
            <div className="p-4 bg-slate-950 flex-1 min-h-[620px] overflow-hidden">
                <div className={`grid gap-5 h-full ${
                    viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`}>
                    
                    {/* LEFT PANEL: MS WORD DOCUMENT CANVAS */}
                    {(viewMode === 'split' || viewMode === 'editor') && (
                        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                    <FileText size={14} className="text-blue-400" /> MS Word Document Canvas (Editable)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Click anywhere to edit, format, or type directly
                                </span>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[750px] bg-slate-800/40 flex justify-center">
                                {/* Editable A4 Sheet */}
                                <div
                                    ref={editorRef}
                                    contentEditable={true}
                                    onInput={handleEditorInput}
                                    suppressContentEditableWarning={true}
                                    className="w-full max-w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl p-[10mm_13mm] text-[10.5px] leading-normal outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm"
                                    style={{
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* RIGHT PANEL: LIVE RENDERED A4 OUTPUT PREVIEW */}
                    {(viewMode === 'split' || viewMode === 'preview') && (
                        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                    <Eye size={14} className="text-emerald-400" /> Live Frontend A4 Output (Read-Only Preview)
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        Strict 1-Page Calibrated
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[750px] bg-slate-800/40 flex justify-center">
                                {/* Live A4 Sheet Simulation */}
                                <div
                                    className="w-full max-w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl p-[10mm_13mm] text-[10.5px] leading-normal rounded-sm pointer-events-auto"
                                    style={{
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                        boxSizing: 'border-box'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: currentHtml }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FOOTER STATUS BAR ── */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-300">Track:</span> {activeProfile?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <span className="font-bold text-slate-300">Visibility:</span>
                        {activeProfile?.isPublic !== false ? (
                            <span className="text-emerald-400 font-bold">Public 🌐</span>
                        ) : (
                            <span className="text-amber-400 font-bold">Locked 🔒</span>
                        )}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <span className="font-bold text-slate-300">Featured:</span>
                        {activeProfile?.isFeatured ? (
                            <span className="text-yellow-400 font-bold">Yes ⭐ (Primary Default)</span>
                        ) : (
                            <span className="text-slate-500">No</span>
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px] animate-pulse">
                            <AlertTriangle size={12} /> Unsaved changes in Word canvas
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onSaveProfiles}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                        Save All Changes
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ResumeWordEditor;

