import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
    BIO as FALLBACK_BIO, 
    SKILLS as FALLBACK_SKILLS, 
    PROJECTS as FALLBACK_PROJECTS, 
    CONTACT as FALLBACK_CONTACT, 
    EXPERIENCE as FALLBACK_EXPERIENCE, 
    EDUCATION as FALLBACK_EDUCATION, 
    RESEARCH_PAPERS as FALLBACK_RESEARCH_PAPERS,
    DEFAULT_CV_PROFILES 
} from '../constants/content';
import { AlbumDashboard } from '../components/AlbumManager';
import { 
    LogOut, User, Briefcase, Code, GraduationCap, Link as LinkIcon, 
    Save, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Upload,
    CheckCircle, XCircle, Loader, Image, BarChart2, Star, BookOpen,
    Sparkles, FileText, Check, Bot, AlertCircle, FileUp, Key
} from 'lucide-react';
import { getStats } from '../services/analyticsService';
import { getCvProfiles, updateCvProfiles } from '../services/portfolioService';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ---- Reusable Input Components ----
const Input = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
        <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all" />
    </div>
);

const Textarea = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
        <textarea value={value || ''} onChange={onChange} rows={rows} placeholder={placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all resize-none" />
    </div>
);

const SectionCard = ({ title, icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-50 to-white hover:from-blue-50 transition-all">
                <div className="flex items-center gap-3 font-bold text-slate-800 text-lg">{icon}{title}</div>
                {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            {open && <div className="px-6 pb-6 pt-2">{children}</div>}
        </div>
    );
};

const Toast = ({ message, type }) => (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold transition-all
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        {message}
    </div>
);

// ---- Main Dashboard Component ----
const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [toast, setToast] = useState(null);

    // Data States
    const [bio, setBio] = useState(FALLBACK_BIO);
    const [contact, setContact] = useState(FALLBACK_CONTACT);
    const [skills, setSkills] = useState(FALLBACK_SKILLS);
    const [experience, setExperience] = useState(FALLBACK_EXPERIENCE);
    const [education, setEducation] = useState(FALLBACK_EDUCATION);
    const [researchPapers, setResearchPapers] = useState(FALLBACK_RESEARCH_PAPERS);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalVisitors: 0, dailyVisitors: 0, totalTimeSpentMinutes: 0 });

    // CV Profiles & AI Circular States
    const [cvProfiles, setCvProfiles] = useState(DEFAULT_CV_PROFILES);
    const [selectedTrackId, setSelectedTrackId] = useState('software');
    const [circularText, setCircularText] = useState('');
    const [circularImage, setCircularImage] = useState(null);
    const [circularFileName, setCircularFileName] = useState('');
    const [isAnalyzingCircular, setIsAnalyzingCircular] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
    const [geminiApiKey, setGeminiApiKey] = useState(() => {
        return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    });
    const [showKeySetting, setShowKeySetting] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ---- Load all data from Firebase ----
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const profileSnap = await getDoc(doc(db, 'portfolio', 'profile'));
                if (profileSnap.exists()) {
                    const d = profileSnap.data();
                    const addr = (d.contact && d.contact.address) || (d.bio && (d.bio.address || d.bio.location)) || FALLBACK_BIO.location || '';
                    const phoneVal = (d.contact && (d.contact.phone || d.contact.contactNo)) || '';

                    if (d.bio) {
                        setBio({
                            ...FALLBACK_BIO,
                            ...d.bio,
                            location: d.bio.location || addr,
                            address: d.bio.address || d.bio.location || addr,
                        });
                    }
                    if (d.contact) {
                        setContact({
                            ...FALLBACK_CONTACT,
                            ...d.contact,
                            phone: phoneVal,
                            contactNo: phoneVal,
                            address: addr,
                        });
                    }
                    if (d.skills) setSkills(d.skills);
                    if (d.experience) setExperience(d.experience);
                    if (d.education) setEducation(d.education);
                    if (d.researchPapers) setResearchPapers(d.researchPapers);
                }

                const projSnap = await getDocs(collection(db, 'projects'));
                if (!projSnap.empty) {
                    setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                } else {
                    setProjects(FALLBACK_PROJECTS.map(p => ({ ...p, id: null })));
                }

                // Load CV profiles
                const loadedProfiles = await getCvProfiles();
                if (loadedProfiles && loadedProfiles.length > 0) {
                    setCvProfiles(loadedProfiles);
                }

                // stats fetched via onSnapshot
            } catch (err) {
                console.error('Fetch error:', err);
                showToast('Error loading data from Firebase', 'error');
            }
        };
        fetchAll();
    }, []);

    // ---- Real-time Stats Listener ----
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'portfolio', 'stats'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const today = new Date().toISOString().split('T')[0];
                if (data.lastDate !== today) {
                    setStats({ ...data, dailyVisitors: 0 });
                } else {
                    setStats(data);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // ---- Save profile to Firebase ----
    const saveProfile = async () => {
        setSaving(true);
        try {
            const updatedBio = {
                ...bio,
                location: bio.address || bio.location || '',
                address: bio.address || bio.location || '',
            };
            const updatedContact = {
                ...contact,
                phone: contact.phone || contact.contactNo || '',
                contactNo: contact.phone || contact.contactNo || '',
                address: contact.address || updatedBio.address || '',
            };
            await setDoc(doc(db, 'portfolio', 'profile'), {
                bio: updatedBio,
                contact: updatedContact,
                skills,
                experience,
                education,
                researchPapers
            }, { merge: true });
            await updateCvProfiles(cvProfiles);
            setBio(updatedBio);
            setContact(updatedContact);
            showToast('Profile and CV Tracks saved successfully!');
        } catch (err) {
            console.error('Save error:', err);
            showToast('Error saving profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ---- Seed Database with constants ----
    const handleSeed = async () => {
        if (!window.confirm("This will push your initial hardcoded data to Firebase. Continue?")) return;
        setSeeding(true);
        try {
            await setDoc(doc(db, 'portfolio', 'profile'), {
                bio: FALLBACK_BIO, contact: FALLBACK_CONTACT, skills: FALLBACK_SKILLS,
                experience: FALLBACK_EXPERIENCE, education: FALLBACK_EDUCATION,
                researchPapers: FALLBACK_RESEARCH_PAPERS
            });
            const projSnap = await getDocs(collection(db, 'projects'));
            if (projSnap.empty) {
                for (const p of FALLBACK_PROJECTS) {
                    await addDoc(collection(db, 'projects'), p);
                }
            }
            // Reload
            const profileSnap = await getDoc(doc(db, 'portfolio', 'profile'));
            if (profileSnap.exists()) {
                const d = profileSnap.data();
                const addr = (d.contact && d.contact.address) || (d.bio && (d.bio.address || d.bio.location)) || FALLBACK_BIO.location || '';
                const phoneVal = (d.contact && (d.contact.phone || d.contact.contactNo)) || '';
                if (d.bio) setBio({ ...FALLBACK_BIO, ...d.bio, address: addr });
                if (d.contact) setContact({ ...FALLBACK_CONTACT, ...d.contact, phone: phoneVal, contactNo: phoneVal, address: addr });
                if (d.skills) setSkills(d.skills);
                if (d.experience) setExperience(d.experience);
                if (d.education) setEducation(d.education);
                if (d.researchPapers) setResearchPapers(d.researchPapers);
            }
            const ps = await getDocs(collection(db, 'projects'));
            setProjects(ps.docs.map(d => ({ id: d.id, ...d.data() })));
            await updateCvProfiles(DEFAULT_CV_PROFILES);
            setCvProfiles(DEFAULT_CV_PROFILES);
            showToast('Database seeded successfully!');
        } catch (err) {
            showToast('Seeding failed: ' + err.message, 'error');
        } finally {
            setSeeding(false);
        }
    };

    // ---- CV Profile & AI Circular Handlers ----
    const activeProfile = cvProfiles.find(p => p.id === selectedTrackId) || cvProfiles[0] || DEFAULT_CV_PROFILES[0];

    const updateActiveProfile = (field, value) => {
        setCvProfiles(prev => prev.map(p => p.id === activeProfile.id ? { ...p, [field]: value } : p));
    };

    const toggleProfileProject = (projectTitle) => {
        const currentList = activeProfile.featuredProjectTitles || [];
        const nextList = currentList.includes(projectTitle)
            ? currentList.filter(t => t !== projectTitle)
            : [...currentList, projectTitle];
        updateActiveProfile('featuredProjectTitles', nextList);
    };

    const toggleProfileSkillCategory = (categoryName) => {
        const currentList = activeProfile.skillsCategories || [];
        const nextList = currentList.includes(categoryName)
            ? currentList.filter(c => c !== categoryName)
            : [...currentList, categoryName];
        updateActiveProfile('skillsCategories', nextList);
    };

    const saveCvProfilesOnly = async () => {
        setSaving(true);
        try {
            await updateCvProfiles(cvProfiles);
            showToast('Targeted CV Tracks saved successfully!');
        } catch (err) {
            console.error('Failed to save CV profiles:', err);
            showToast('Error saving CV profiles', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCircularFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCircularFileName(file.name);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCircularImage(ev.target.result);
                showToast(`Loaded circular image: ${file.name}`);
            };
            reader.readAsDataURL(file);
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCircularText(ev.target.result);
                setCircularImage(null);
                showToast(`Loaded text from: ${file.name}`);
            };
            reader.readAsText(file);
        }
    };

    const analyzeCircularWithAI = async () => {
        if (!circularText.trim() && !circularImage) {
            showToast('Please paste circular text or upload a circular file first.', 'error');
            return;
        }

        const activeKey = geminiApiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY;
        if (!activeKey) {
            setShowKeySetting(true);
            showToast('Please provide a Gemini API Key to enable AI Circular Analysis', 'error');
            return;
        }

        setIsAnalyzingCircular(true);
        setAiAnalysisResult(null);

        try {
            const genAI = new GoogleGenerativeAI(activeKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
You are an expert ATS Resume Coach and Technical Hiring Recruiter.
Analyze the following Job Circular / Job Description:
"""
${circularText}
"""

The candidate applying is Abdur Rahman Rafi, CS student with expertise across:
- Web Development (React, Next.js, Node.js, Python, Flask, Supabase, MySQL, Tailwind CSS)
- Systems & Cybersecurity (Vulnerability Assessment, Penetration Testing, Linux Hardening, Network Administration, Cisco Certified)
- Projects: EduSync, Prescribo, BAFSK Math Club Portal, UIU CGPA & Scholarship Calculator, Spinal Abnormality Detection (AI), BiteMap
- Experience: CodemanBD (Cybersecurity Intern), Webbattalion (Web Developer), BAFSK Math Club (President & Developer).

Task:
Extract essential requirements from this circular to create an ultra-tailored, ATS-optimized 1-page CV profile.
Return ONLY valid JSON (no markdown fences, no explanatory text):
{
  "targetRole": "Exact job title tailored to this circular (e.g. 'Software Engineer', 'IT Officer', 'Cybersecurity Specialist')",
  "trackBadge": "Brief sector badge (e.g. 'Tech / Software', 'Bank / Enterprise', 'Cybersecurity', 'Corporate IT')",
  "atsSummary": "A tailored, high-impact 2-3 sentence ATS professional summary emphasizing candidate qualifications matching this circular's requirements.",
  "recommendedSkillsCategories": ["Web Development", "Tools & Core", "Security & Systems"],
  "recommendedProjectTitles": ["EduSync", "Prescribo"],
  "matchingKeywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4", "Keyword5"],
  "atsTips": [
    "Advice on passing the ATS filter for this role",
    "Key area to prepare for the technical interview"
  ]
}
`;

            let contents;
            if (circularImage) {
                const base64Data = circularImage.split(',')[1];
                const mimeType = circularImage.split(';')[0].split(':')[1];
                contents = [
                    prompt,
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    }
                ];
            } else {
                contents = prompt;
            }

            const result = await model.generateContent(contents);
            const text = result.response.text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            setAiAnalysisResult(parsed);
            showToast('Circular analyzed! Click "Apply to This Profile" to import suggestions.');
        } catch (err) {
            console.error('AI Circular Analysis error:', err);
            showToast('AI Analysis failed: ' + (err.message || 'Check API key or format'), 'error');
        } finally {
            setIsAnalyzingCircular(false);
        }
    };

    const applyAiSuggestionsToCurrentTrack = () => {
        if (!aiAnalysisResult) return;

        setCvProfiles(prev => prev.map(p => {
            if (p.id === activeProfile.id) {
                return {
                    ...p,
                    role: aiAnalysisResult.targetRole || p.role,
                    badge: aiAnalysisResult.trackBadge || p.badge,
                    summary: aiAnalysisResult.atsSummary || p.summary,
                    skillsCategories: aiAnalysisResult.recommendedSkillsCategories || p.skillsCategories,
                    featuredProjectTitles: aiAnalysisResult.recommendedProjectTitles || p.featuredProjectTitles,
                    customKeywords: Array.isArray(aiAnalysisResult.matchingKeywords) 
                        ? aiAnalysisResult.matchingKeywords.join(', ') 
                        : (aiAnalysisResult.matchingKeywords || p.customKeywords)
                };
            }
            return p;
        }));

        showToast(`Applied AI suggestions to "${activeProfile.name}". Remember to click Save!`);
    };

    const handleAddTrack = () => {
        const name = window.prompt("Enter new CV Track name (e.g. 'Data Analyst' or 'Govt IT Specialist'):");
        if (!name || !name.trim()) return;

        const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (cvProfiles.some(p => p.id === newId)) {
            alert('A track with this name already exists.');
            return;
        }

        const newTrack = {
            id: newId,
            name: name.trim(),
            badge: name.trim(),
            role: `${name.trim()} Specialist`,
            summary: bio.summary || 'Demonstrated professional with strong foundation in technology, computational analysis, and modern engineering practices.',
            skillsCategories: ['Web Development', 'Tools & Core'],
            featuredProjectTitles: projects.slice(0, 2).map(p => p.title),
            featuredExperienceRoles: experience.slice(0, 2).map(e => e.role),
            customKeywords: 'Problem Solving, Computer Science, System Architecture'
        };

        setCvProfiles(prev => [...prev, newTrack]);
        setSelectedTrackId(newId);
        showToast(`Created track: ${name}`);
    };

    const handleDeleteTrack = (trackId) => {
        if (['software', 'banking', 'cybersecurity'].includes(trackId)) {
            alert('The core default tracks (Software, Banking, Cybersecurity) cannot be deleted, but you can edit all their fields!');
            return;
        }
        if (window.confirm('Delete this custom CV track?')) {
            setCvProfiles(prev => prev.filter(p => p.id !== trackId));
            setSelectedTrackId('software');
            showToast('Track deleted.');
        }
    };

    // ---- Project CRUD ----
    const addProject = () => {
        setProjects(prev => [...prev, { id: null, title: '', description: '', tech: [], link: '#', hidden: false }]);
    };

    const updateProject = (idx, field, value) => {
        setProjects(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    };

    const saveProject = async (idx) => {
        const proj = { ...projects[idx] };
        const { id, ...data } = proj;
        if (typeof data.tech === 'string') data.tech = data.tech.split(',').map(t => t.trim());
        try {
            if (id) {
                await updateDoc(doc(db, 'projects', id), data);
            } else {
                const ref = await addDoc(collection(db, 'projects'), data);
                setProjects(prev => prev.map((p, i) => i === idx ? { ...p, id: ref.id } : p));
            }
            showToast('Project saved!');
        } catch (err) {
            showToast('Error saving project', 'error');
        }
    };

    const deleteProject = async (idx) => {
        const proj = projects[idx];
        if (!window.confirm(`Delete "${proj.title}"?`)) return;
        try {
            if (proj.id) await deleteDoc(doc(db, 'projects', proj.id));
            setProjects(prev => prev.filter((_, i) => i !== idx));
            showToast('Project deleted!');
        } catch (err) {
            showToast('Error deleting project', 'error');
        }
    };

    // ---- Experience CRUD ----
    const addExperience = () => {
        setExperience(prev => [...prev, { role: '', company: '', duration: '', description: [''] }]);
    };
    const removeExperience = (idx) => setExperience(prev => prev.filter((_, i) => i !== idx));

    // ---- Education CRUD ----
    const addEducation = () => {
        setEducation(prev => [...prev, { institution: '', degree: '', duration: '', description: '' }]);
    };
    const removeEducation = (idx) => setEducation(prev => prev.filter((_, i) => i !== idx));

    // ---- Research Papers CRUD ----
    const addResearchPaper = () => {
        setResearchPapers(prev => [...prev, { title: '', status: 'Published', venue: '', date: '', link: '#', description: '' }]);
    };
    const removeResearchPaper = (idx) => setResearchPapers(prev => prev.filter((_, i) => i !== idx));

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            {toast && <Toast {...toast} />}

            {/* Top Bar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Portfolio Dashboard</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage your public portfolio in real-time</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                        <button onClick={handleSeed} disabled={seeding}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50">
                            {seeding ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
                            {seeding ? 'Seeding...' : 'Seed DB'}
                        </button>
                        <button onClick={saveProfile} disabled={saving}
                            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                            {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
                            {saving ? 'Saving...' : 'Save All'}
                        </button>
                        <button onClick={async () => { await logout(); navigate('/login'); }}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all">
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

                {/* OVERVIEW & STATISTICS */}
                <SectionCard title="Overview & Statistics" icon={<BarChart2 size={22} className="text-orange-600" />}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
                            <div className="text-sm font-semibold text-orange-600 mb-1">Total Visitors</div>
                            <div className="text-2xl font-bold text-slate-800">{stats.totalVisitors || 0}</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                            <div className="text-sm font-semibold text-blue-600 mb-1">Daily Visitors</div>
                            <div className="text-2xl font-bold text-slate-800">{stats.dailyVisitors || 0}</div>
                        </div>
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                            <div className="text-sm font-semibold text-green-600 mb-1">Total Time Spent</div>
                            <div className="text-2xl font-bold text-slate-800">{stats.totalTimeSpentMinutes || 0} min</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center flex flex-col justify-center items-center">
                            <div className="text-sm font-semibold text-yellow-600 mb-1 flex items-center gap-1"><Star size={14} /> Total Stars</div>
                            <div className="text-2xl font-bold text-slate-800">
                                {projects.reduce((acc, p) => acc + (p.stars || 0), 0)}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* PROFILE INFO */}
                <SectionCard title="Profile Information" icon={<User size={22} className="text-blue-600" />}>
                    <div className="mb-4">
                        <Input label="Avatar Image URL (leave blank to use default)" value={bio.avatar} onChange={e => setBio(p => ({ ...p, avatar: e.target.value }))} placeholder="/profile.png or https://..." />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Full Name" value={bio.name} onChange={e => setBio(p => ({ ...p, name: e.target.value }))} />
                        <Input label="Role / Title" value={bio.role} onChange={e => setBio(p => ({ ...p, role: e.target.value }))} />
                        <Input label="Location / Address" value={bio.address ?? bio.location ?? ''} onChange={e => {
                            const val = e.target.value;
                            setBio(p => ({ ...p, location: val, address: val }));
                            setContact(p => ({ ...p, address: val }));
                        }} />
                    </div>
                    <Textarea label="Summary" value={bio.summary} onChange={e => setBio(p => ({ ...p, summary: e.target.value }))} rows={2} />
                    <Textarea label="Detailed Bio" value={bio.detailed} onChange={e => setBio(p => ({ ...p, detailed: e.target.value }))} rows={4} />
                </SectionCard>

                {/* TARGETED CV TRACKS & AI CIRCULAR ANALYZER */}
                <SectionCard title="Targeted CV Tracks & AI Circular Tailor" icon={<Sparkles size={22} className="text-indigo-600" />}>
                    <div className="space-y-6">
                        <p className="text-sm text-slate-500">
                            Create sector-specific CVs (IT vs Banking vs Cybersecurity) so each application has a targeted title, ATS-optimized summary, and relevant projects. You can paste or upload any recruitment circular below and let Gemini AI automatically tailor your profile!
                        </p>

                        {/* Track Selector Tabs */}
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar w-full">
                            {cvProfiles.map(track => (
                                <div key={track.id} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedTrackId(track.id); setAiAnalysisResult(null); }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            selectedTrackId === track.id
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span>{track.name}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                            selectedTrackId === track.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {track.badge || track.id}
                                        </span>
                                    </button>
                                    {!['software', 'banking', 'cybersecurity'].includes(track.id) && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTrack(track.id)}
                                            className="ml-1 p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                            title="Delete custom track"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddTrack}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 text-sm font-medium transition-all"
                            >
                                <Plus size={15} /> Add Custom Track
                            </button>
                        </div>

                        {/* AI Circular Analyzer Box */}
                        <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-600 text-white rounded-xl">
                                        <Bot size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Recruitment Circular AI Assistant</h4>
                                        <p className="text-xs text-slate-500">Paste job circular text or upload a circular image/document</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowKeySetting(!showKeySetting)}
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    <Key size={13} /> {showKeySetting ? 'Hide API Key' : 'Gemini Key Config'}
                                </button>
                            </div>

                            {/* Optional API key field */}
                            {showKeySetting && (
                                <div className="mb-4 p-3 bg-white border border-indigo-200 rounded-xl">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Google Gemini API Key (saved in browser):
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={geminiApiKey}
                                            onChange={(e) => {
                                                setGeminiApiKey(e.target.value);
                                                localStorage.setItem('gemini_api_key', e.target.value);
                                            }}
                                            placeholder="Enter AIzaSy..."
                                            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                localStorage.setItem('gemini_api_key', geminiApiKey);
                                                showToast('API Key saved locally');
                                                setShowKeySetting(false);
                                            }}
                                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Circular Text Input */}
                            <div className="mb-3">
                                <textarea
                                    rows={4}
                                    value={circularText}
                                    onChange={(e) => setCircularText(e.target.value)}
                                    placeholder="Paste the full recruitment circular / job advertisement / JD text here (requirements, job responsibilities, skills, educational qualifications)..."
                                    className="w-full border border-indigo-200/80 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/90 placeholder:text-slate-400"
                                />
                            </div>

                            {/* File Upload & Trigger Row */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 cursor-pointer transition-all shadow-sm">
                                        <FileUp size={15} />
                                        <span className="truncate max-w-[200px]">{circularFileName ? circularFileName : 'Upload Circular (Image / Text)'}</span>
                                        <input
                                            type="file"
                                            accept="image/*,.txt,.md,.doc,.docx"
                                            onChange={handleCircularFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {(circularFileName || circularImage) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCircularFileName('');
                                                setCircularImage(null);
                                                setCircularText('');
                                            }}
                                            className="text-xs text-red-500 hover:underline shrink-0"
                                        >
                                            Clear File
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={analyzeCircularWithAI}
                                    disabled={isAnalyzingCircular}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-60"
                                >
                                    {isAnalyzingCircular ? <Loader size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                    {isAnalyzingCircular ? 'Analyzing Circular...' : '⚡ Analyze Circular & Auto-Tailor'}
                                </button>
                            </div>

                            {/* AI Analysis Result Card */}
                            {aiAnalysisResult && (
                                <div className="mt-4 p-4 bg-white border border-emerald-200 rounded-xl shadow-sm space-y-3">
                                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                            <CheckCircle size={15} className="text-emerald-600" /> AI Circular Analysis Complete
                                        </span>
                                        <button
                                            type="button"
                                            onClick={applyAiSuggestionsToCurrentTrack}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                                        >
                                            <Check size={14} /> Apply to "{activeProfile?.name}"
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="font-semibold text-slate-500">Suggested Target Title:</span>
                                            <div className="font-bold text-slate-900 mt-0.5">{aiAnalysisResult.targetRole}</div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-slate-500">Track Badge:</span>
                                            <div className="font-medium text-slate-800 mt-0.5">{aiAnalysisResult.trackBadge}</div>
                                        </div>
                                    </div>

                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-500">Generated ATS Summary:</span>
                                        <p className="text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                                            {aiAnalysisResult.atsSummary}
                                        </p>
                                    </div>

                                    {aiAnalysisResult.matchingKeywords && (
                                        <div className="text-xs">
                                            <span className="font-semibold text-slate-500">Top Circular Keywords:</span>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {(Array.isArray(aiAnalysisResult.matchingKeywords)
                                                    ? aiAnalysisResult.matchingKeywords
                                                    : aiAnalysisResult.matchingKeywords.split(',')
                                                ).map((kw, idx) => (
                                                    <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px] font-medium">
                                                        {kw.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {aiAnalysisResult.atsTips && aiAnalysisResult.atsTips.length > 0 && (
                                        <div className="text-xs bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-amber-900">
                                            <span className="font-bold block mb-1">💡 Recruiter Shortlisting Advice:</span>
                                            <ul className="list-disc list-inside space-y-0.5 text-[11.5px]">
                                                {aiAnalysisResult.atsTips.map((tip, i) => (
                                                    <li key={i}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Customization Form */}
                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h4 className="font-bold text-slate-800 text-sm">
                                    Customize "{activeProfile?.name}" Settings
                                </h4>
                                <span className="text-xs text-slate-500">Changes reflect on PDF generation instantly</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Target Job Title (Appears at top of CV)"
                                    value={activeProfile?.role || ''}
                                    onChange={(e) => updateActiveProfile('role', e.target.value)}
                                    placeholder="e.g. IT Officer / Junior Software Engineer"
                                />
                                <Input
                                    label="Track Badge / Sector Name"
                                    value={activeProfile?.badge || ''}
                                    onChange={(e) => updateActiveProfile('badge', e.target.value)}
                                    placeholder="e.g. Bank / Enterprise or Tech / Software"
                                />
                            </div>

                            <Textarea
                                label="ATS-Optimized Summary (2-3 sentences recommended for 1-page fit)"
                                value={activeProfile?.summary || ''}
                                onChange={(e) => updateActiveProfile('summary', e.target.value)}
                                rows={3}
                            />

                            <Input
                                label="Target ATS Keywords (Comma separated)"
                                value={activeProfile?.customKeywords || ''}
                                onChange={(e) => updateActiveProfile('customKeywords', e.target.value)}
                                placeholder="Database, SQL, Network Security, React, Python..."
                            />

                            {/* Featured Projects Selection (for 1-page CV) */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Featured Projects for this Track (Select 2-3 to ensure strict 1-page fit):
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Check the projects most relevant to this specific role:
                                </p>
                                <div className="grid md:grid-cols-2 gap-2">
                                    {projects.map((proj, idx) => {
                                        const isSelected = (activeProfile?.featuredProjectTitles || []).includes(proj.title);
                                        return (
                                            <label
                                                key={idx}
                                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-medium'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleProfileProject(proj.title)}
                                                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <div className="font-semibold">{proj.title}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">
                                                        {Array.isArray(proj.tech) ? proj.tech.slice(0, 3).join(', ') : proj.tech}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Skills Categories to Prioritize */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Skills Categories to Include:
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {skills.map((skillGroup, idx) => {
                                        const isSelected = (activeProfile?.skillsCategories || []).includes(skillGroup.category);
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => toggleProfileSkillCategory(skillGroup.category)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {skillGroup.category} {isSelected ? '✓' : '+'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Save Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={saveCvProfilesOnly}
                                    disabled={saving}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                                >
                                    <Save size={16} /> Save All CV Tracks
                                </button>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* CONTACT / SOCIAL LINKS */}
                <SectionCard title="Contact & Social Links" icon={<LinkIcon size={22} className="text-indigo-600" />}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Contact No / Phone" value={contact.phone ?? ''} onChange={e => {
                            const val = e.target.value;
                            setContact(p => ({ ...p, phone: val, contactNo: val }));
                        }} placeholder="+880 1XXXXXXXXX" type="tel" />
                        <Input label="Email" value={contact.email ?? ''} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} type="email" />
                        <Input label="Address" value={contact.address ?? ''} onChange={e => {
                            const val = e.target.value;
                            setContact(p => ({ ...p, address: val }));
                            setBio(p => ({ ...p, address: val, location: val }));
                        }} placeholder="e.g. Dhaka, Bangladesh" />
                        <Input label="GitHub URL" value={contact.github} onChange={e => setContact(p => ({ ...p, github: e.target.value }))} />
                        <Input label="LinkedIn URL" value={contact.linkedin} onChange={e => setContact(p => ({ ...p, linkedin: e.target.value }))} />
                        <Input label="Facebook URL" value={contact.facebook} onChange={e => setContact(p => ({ ...p, facebook: e.target.value }))} />
                    </div>
                </SectionCard>

                {/* PROJECTS */}
                <SectionCard title="Projects" icon={<Code size={22} className="text-green-600" />}>
                    <div className="space-y-6">
                        {projects.map((proj, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">{proj.title || `Project ${idx + 1}`}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateProject(idx, 'hidden', !proj.hidden)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-all ${proj.hidden ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                                            title={proj.hidden ? 'Hidden from public' : 'Visible to public'}>
                                            {proj.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => saveProject(idx)}
                                            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">
                                            <Save size={16} />
                                        </button>
                                        <button onClick={() => deleteProject(idx)}
                                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input label="Title" value={proj.title} onChange={e => updateProject(idx, 'title', e.target.value)} />
                                    <Input label="Link" value={proj.link} onChange={e => updateProject(idx, 'link', e.target.value)} />
                                </div>
                                <Textarea label="Description" value={proj.description} onChange={e => updateProject(idx, 'description', e.target.value)} rows={2} />
                                <Input label="Tech Stack (comma separated)" value={Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech} onChange={e => updateProject(idx, 'tech', e.target.value)} />
                            </div>
                        ))}
                        <button onClick={addProject}
                            className="flex items-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 font-semibold justify-center transition-all text-sm">
                            <Plus size={18} /> Add New Project
                        </button>
                    </div>
                </SectionCard>

                {/* EXPERIENCE */}
                <SectionCard title="Experience" icon={<Briefcase size={22} className="text-purple-600" />}>
                    <div className="space-y-6">
                        {experience.map((exp, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">{exp.role || `Experience ${idx + 1}`}</h3>
                                    <button onClick={() => removeExperience(idx)}
                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Input label="Role" value={exp.role} onChange={e => setExperience(prev => prev.map((x, i) => i === idx ? { ...x, role: e.target.value } : x))} />
                                    <Input label="Company" value={exp.company} onChange={e => setExperience(prev => prev.map((x, i) => i === idx ? { ...x, company: e.target.value } : x))} />
                                    <Input label="Duration" value={exp.duration} onChange={e => setExperience(prev => prev.map((x, i) => i === idx ? { ...x, duration: e.target.value } : x))} />
                                </div>
                                <Textarea label="Description (one point per line)"
                                    value={Array.isArray(exp.description) ? exp.description.join('\n') : exp.description}
                                    onChange={e => setExperience(prev => prev.map((x, i) => i === idx ? { ...x, description: e.target.value.split('\n') } : x))}
                                    rows={4} />
                            </div>
                        ))}
                        <button onClick={addExperience}
                            className="flex items-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 text-slate-500 hover:text-purple-600 font-semibold justify-center transition-all text-sm">
                            <Plus size={18} /> Add Experience
                        </button>
                        <div className="flex justify-end pt-2">
                            <button onClick={saveProfile} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
                                <Save size={16} /> Save Experience
                            </button>
                        </div>
                    </div>
                </SectionCard>

                {/* EDUCATION */}
                <SectionCard title="Education" icon={<GraduationCap size={22} className="text-yellow-600" />}>
                    <div className="space-y-6">
                        {education.map((edu, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">{edu.institution || `Education ${idx + 1}`}</h3>
                                    <button onClick={() => removeEducation(idx)}
                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input label="Institution" value={edu.institution} onChange={e => setEducation(prev => prev.map((x, i) => i === idx ? { ...x, institution: e.target.value } : x))} />
                                    <Input label="Degree" value={edu.degree} onChange={e => setEducation(prev => prev.map((x, i) => i === idx ? { ...x, degree: e.target.value } : x))} />
                                    <Input label="Duration / Year" value={edu.duration} onChange={e => setEducation(prev => prev.map((x, i) => i === idx ? { ...x, duration: e.target.value } : x))} />
                                    <Input label="Description / GPA" value={edu.description} onChange={e => setEducation(prev => prev.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
                                </div>
                            </div>
                        ))}
                        <button onClick={addEducation}
                            className="flex items-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-yellow-400 text-slate-500 hover:text-yellow-600 font-semibold justify-center transition-all text-sm">
                            <Plus size={18} /> Add Education
                        </button>
                        <div className="flex justify-end pt-2">
                            <button onClick={saveProfile} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
                                <Save size={16} /> Save Education
                            </button>
                        </div>
                    </div>
                </SectionCard>

                {/* RESEARCH PAPERS */}
                <SectionCard title="Research Papers" icon={<BookOpen size={22} className="text-pink-600" />}>
                    <div className="space-y-6">
                        {researchPapers.map((paper, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">{paper.title || `Research Paper ${idx + 1}`}</h3>
                                    <button onClick={() => removeResearchPaper(idx)}
                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input label="Title" value={paper.title} onChange={e => setResearchPapers(prev => prev.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} />
                                    <Input label="Status (Published / Unpublished)" value={paper.status} onChange={e => setResearchPapers(prev => prev.map((x, i) => i === idx ? { ...x, status: e.target.value } : x))} />
                                    <Input label="Venue / Journal" value={paper.venue} onChange={e => setResearchPapers(prev => prev.map((x, i) => i === idx ? { ...x, venue: e.target.value } : x))} />
                                    <Input label="Year / Date" value={paper.date} onChange={e => setResearchPapers(prev => prev.map((x, i) => i === idx ? { ...x, date: e.target.value } : x))} />
                                    <Input label="Link" value={paper.link} onChange={e => setResearchPapers(prev => prev.map((x, i) => i === idx ? { ...x, link: e.target.value } : x))} />
                                </div>
                                <Textarea label="Description / Abstract" value={paper.description} onChange={e => setResearchPapers(prev => prev.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} rows={3} />
                            </div>
                        ))}
                        <button onClick={addResearchPaper}
                            className="flex items-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-pink-400 text-slate-500 hover:text-pink-600 font-semibold justify-center transition-all text-sm">
                            <Plus size={18} /> Add Research Paper
                        </button>
                        <div className="flex justify-end pt-2">
                            <button onClick={saveProfile} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
                                <Save size={16} /> Save Research Papers
                            </button>
                        </div>
                    </div>
                </SectionCard>

                {/* ALBUM & ACHIEVEMENTS */}
                <SectionCard title="Album & Achievements" icon={<Image size={22} className="text-amber-500" />} defaultOpen={false}>
                    <p className="text-sm text-slate-500 mb-5">Upload photos, achievement certificates, awards and more. Click the image box to upload a file. Toggle visibility with the eye icon. Changes save individually per item.</p>
                    <AlbumDashboard showToast={showToast} />
                </SectionCard>

            </div>
        </div>
    );
};

export default Dashboard;
