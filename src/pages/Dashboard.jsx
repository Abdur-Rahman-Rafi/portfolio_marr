import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { BIO as FALLBACK_BIO, SKILLS as FALLBACK_SKILLS, PROJECTS as FALLBACK_PROJECTS, CONTACT as FALLBACK_CONTACT, EXPERIENCE as FALLBACK_EXPERIENCE, EDUCATION as FALLBACK_EDUCATION } from '../constants/content';
import { AlbumDashboard } from '../components/AlbumManager';
import { 
    LogOut, User, Briefcase, Code, GraduationCap, Link as LinkIcon, 
    Save, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Upload,
    CheckCircle, XCircle, Loader, Image, BarChart2, Star
} from 'lucide-react';
import { getStats } from '../services/analyticsService';

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
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalVisitors: 0, dailyVisitors: 0, totalTimeSpentMinutes: 0 });

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
                    if (d.bio) setBio(d.bio);
                    if (d.contact) setContact(d.contact);
                    if (d.skills) setSkills(d.skills);
                    if (d.experience) setExperience(d.experience);
                    if (d.education) setEducation(d.education);
                }

                const projSnap = await getDocs(collection(db, 'projects'));
                if (!projSnap.empty) {
                    setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                } else {
                    setProjects(FALLBACK_PROJECTS.map(p => ({ ...p, id: null })));
                }

                const statsData = await getStats();
                if (statsData) setStats(statsData);
            } catch (err) {
                console.error('Fetch error:', err);
                showToast('Error loading data from Firebase', 'error');
            }
        };
        fetchAll();
    }, []);

    // ---- Save profile to Firebase ----
    const saveProfile = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'portfolio', 'profile'), { bio, contact, skills, experience, education }, { merge: true });
            showToast('Profile saved successfully!');
        } catch (err) {
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
                experience: FALLBACK_EXPERIENCE, education: FALLBACK_EDUCATION
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
                if (d.bio) setBio(d.bio);
                if (d.contact) setContact(d.contact);
                if (d.skills) setSkills(d.skills);
                if (d.experience) setExperience(d.experience);
                if (d.education) setEducation(d.education);
            }
            const ps = await getDocs(collection(db, 'projects'));
            setProjects(ps.docs.map(d => ({ id: d.id, ...d.data() })));
            showToast('Database seeded successfully!');
        } catch (err) {
            showToast('Seeding failed: ' + err.message, 'error');
        } finally {
            setSeeding(false);
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

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            {toast && <Toast {...toast} />}

            {/* Top Bar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portfolio Dashboard</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage your public portfolio in real-time</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSeed} disabled={seeding}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                            {seeding ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                            {seeding ? 'Seeding...' : 'Seed DB'}
                        </button>
                        <button onClick={saveProfile} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save All'}
                        </button>
                        <button onClick={async () => { await logout(); navigate('/login'); }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

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
                        <Input label="Location" value={bio.location} onChange={e => setBio(p => ({ ...p, location: e.target.value }))} />
                    </div>
                    <Textarea label="Summary" value={bio.summary} onChange={e => setBio(p => ({ ...p, summary: e.target.value }))} rows={2} />
                    <Textarea label="Detailed Bio" value={bio.detailed} onChange={e => setBio(p => ({ ...p, detailed: e.target.value }))} rows={4} />
                </SectionCard>

                {/* CONTACT / SOCIAL LINKS */}
                <SectionCard title="Contact & Social Links" icon={<LinkIcon size={22} className="text-indigo-600" />}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Email" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} type="email" />
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
