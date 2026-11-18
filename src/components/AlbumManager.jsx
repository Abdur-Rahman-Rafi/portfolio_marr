import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Save, X, Eye, EyeOff, Image, Trophy, Loader, Link as LinkIcon } from 'lucide-react';

// Helper to auto-convert Google Drive links to direct image links
const getDisplayUrl = (url) => {
    if (!url) return url;
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1500`;
    }
    return url;
};

// ─── Single Album Item Editor ─────────────────────────────────────
const AlbumItemEditor = ({ item, onSave, onDelete, onToggleHide }) => {
    const [localItem, setLocalItem] = useState(item);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(localItem);
        setSaving(false);
    };

    return (
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Image preview */}
                <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    {localItem.imageUrl
                        ? <img src={getDisplayUrl(localItem.imageUrl)} alt="" className="w-full h-full object-cover" />
                        : <Image size={28} className="text-slate-400" />}
                </div>

                <div className="w-full sm:flex-1 space-y-3">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                        <div className="px-3 text-slate-400"><LinkIcon size={16} /></div>
                        <input
                            value={localItem.imageUrl || ''}
                            onChange={e => setLocalItem(p => ({ ...p, imageUrl: e.target.value }))}
                            placeholder="Image URL (e.g. https://... or /image.png)"
                            className="w-full py-2 pr-3 text-sm focus:outline-none"
                        />
                    </div>
                    <input
                        value={localItem.title || ''}
                        onChange={e => setLocalItem(p => ({ ...p, title: e.target.value }))}
                        placeholder="Title (e.g. Dean's List 2024)"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        value={localItem.caption || ''}
                        onChange={e => setLocalItem(p => ({ ...p, caption: e.target.value }))}
                        placeholder="Caption or description..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <select
                        value={localItem.type || 'photo'}
                        onChange={e => setLocalItem(p => ({ ...p, type: e.target.value }))}
                        className="w-full sm:w-auto border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="photo">📸 Photo</option>
                        <option value="achievement">🏆 Achievement</option>
                        <option value="certificate">📜 Certificate</option>
                        <option value="award">🥇 Award</option>
                    </select>
                </div>

                <div className="flex flex-row sm:flex-col justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button onClick={() => onToggleHide(localItem)} title={localItem.hidden ? 'Show' : 'Hide'}
                        className={`flex-1 sm:flex-initial p-2 rounded-xl transition-all flex items-center justify-center ${localItem.hidden ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {localItem.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 sm:flex-initial p-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all flex items-center justify-center">
                        {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button onClick={() => onDelete(localItem)}
                        className="flex-1 sm:flex-initial p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all flex items-center justify-center">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Dashboard Section ────────────────────────────────────────────
export const AlbumDashboard = ({ showToast }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocs(collection(db, 'album'))
            .then(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => showToast('Error loading album: ' + err.message, 'error'))
            .finally(() => setLoading(false));
    }, []);

    const addItem = () => setItems(p => [...p, { id: null, title: '', caption: '', imageUrl: '', type: 'photo', hidden: false }]);

    const saveItem = async (updated) => {
        const { id, ...data } = updated;
        try {
            if (id) {
                await updateDoc(doc(db, 'album', id), data);
                setItems(p => p.map(i => i.id === id ? { id, ...data } : i));
                showToast('Item saved!');
            } else {
                const ref2 = await addDoc(collection(db, 'album'), data);
                setItems(p => p.map(i => !i.id ? { id: ref2.id, ...data } : i));
                showToast('Item added!');
            }
        } catch (err) { showToast('Save failed', 'error'); }
    };

    const deleteItem = async (item) => {
        if (!window.confirm(`Delete "${item.title || 'this item'}"?`)) return;
        try {
            if (item.id) await deleteDoc(doc(db, 'album', item.id));
            setItems(p => p.filter(i => i.id !== item.id));
            showToast('Deleted!');
        } catch (err) { showToast('Delete failed', 'error'); }
    };

    const toggleHide = async (item) => {
        const updated = { ...item, hidden: !item.hidden };
        await saveItem(updated);
    };

    if (loading) return <div className="py-8 text-center text-slate-400"><Loader size={24} className="animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-5">
            {items.map((item, idx) => (
                <AlbumItemEditor key={item.id || idx} item={item} onSave={saveItem} onDelete={deleteItem} onToggleHide={toggleHide} />
            ))}
            <button onClick={addItem}
                className="flex items-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 font-semibold justify-center transition-all text-sm">
                <Plus size={18} /> Add Photo / Achievement
            </button>
        </div>
    );
};

// ─── Public Album Section (for Portfolio page) ────────────────────
export const AlbumSection = () => {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        getDocs(collection(db, 'album'))
            .then(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => !i.hidden)))
            .catch(() => { });
    }, []);

    const filters = ['all', 'photo', 'achievement', 'certificate', 'award'];
    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

    const typeIcon = (type) => ({ photo: '📸', achievement: '🏆', certificate: '📜', award: '🥇' }[type] || '📸');
    const typeLabel = (type) => ({ photo: 'Photo', achievement: 'Achievement', certificate: 'Certificate', award: 'Award' }[type] || 'Photo');

    if (items.length === 0) return null;

    return (
        <section className="py-20 sm:py-24 px-4 sm:px-6 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 sm:gap-4 mb-6 justify-center"
                >
                    <Trophy className="text-amber-400" size={28} />
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">Album & Achievements</h2>
                </motion.div>

                {/* Filter Pills */}
                <div className="flex gap-2 flex-wrap justify-center mb-10 px-2">
                    {filters.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all
                                ${filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:border-blue-400 hover:text-white'}`}>
                            {f === 'all' ? '✨ All' : `${typeIcon(f)} ${f}`}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    <AnimatePresence>
                        {filtered.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelected(item)}
                                className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 aspect-square"
                            >
                                {item.imageUrl
                                    ? <img src={getDisplayUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-indigo-900/30 text-4xl">{typeIcon(item.type)}</div>
                                }
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
                                    <span className="text-[10px] sm:text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">{typeLabel(item.type)}</span>
                                    <p className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2">{item.title}</p>
                                </div>
                                <div className="absolute top-2.5 right-2.5 text-base sm:text-lg">{typeIcon(item.type)}</div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Lightbox */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
                            onClick={() => setSelected(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.85, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100"
                            >
                                {selected.imageUrl && (
                                    <div className="relative overflow-hidden bg-black shrink-0">
                                        <img src={getDisplayUrl(selected.imageUrl)} alt={selected.title} className="w-full max-h-72 sm:max-h-96 object-contain mx-auto" />
                                    </div>
                                )}
                                <div className="p-5 sm:p-6 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-wider">{typeIcon(selected.type)} {typeLabel(selected.type)}</span>
                                        <button onClick={() => setSelected(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mb-2">{selected.title}</h3>
                                    {selected.caption && <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{selected.caption}</p>}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
