import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { BIO, SKILLS, PROJECTS, CONTACT, EXPERIENCE, EDUCATION, RESEARCH_PAPERS, DEFAULT_CV_PROFILES } from '../constants/content';

// ------------------------------------
// READ OPERATIONS
// ------------------------------------
export const getProfileInfo = async () => {
    const docRef = doc(db, 'portfolio', 'profile');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};

export const getProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ------------------------------------
// WRITE OPERATIONS
// ------------------------------------
export const updateProfileInfo = async (data) => {
    await setDoc(doc(db, 'portfolio', 'profile'), data, { merge: true });
};

export const addProject = async (projectData) => {
    const docRef = await addDoc(collection(db, 'projects'), projectData);
    return { id: docRef.id, ...projectData };
};

export const updateProject = async (id, projectData) => {
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, projectData);
};

export const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
};

export const toggleProjectStar = async (id, isAdding) => {
    const docRef = doc(db, 'projects', id);
    const { increment } = await import('firebase/firestore');
    await updateDoc(docRef, {
        stars: increment(isAdding ? 1 : -1)
    });
};

export const getCvProfiles = async () => {
    try {
        const docRef = doc(db, 'portfolio', 'cv_profiles');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().profiles?.length > 0) {
            return docSnap.data().profiles;
        }
    } catch (e) {
        console.warn('Failed to fetch CV profiles from Firestore, using defaults:', e);
    }
    return DEFAULT_CV_PROFILES;
};

export const updateCvProfiles = async (profiles) => {
    const docRef = doc(db, 'portfolio', 'cv_profiles');
    await setDoc(docRef, { profiles, updatedAt: new Date().toISOString() }, { merge: true });
};

// ------------------------------------
// SEEDING (One-time utility)
// ------------------------------------
export const seedDatabaseWithConstants = async () => {
    // Seed Profile
    await setDoc(doc(db, 'portfolio', 'profile'), {
        bio: BIO,
        contact: CONTACT,
        skills: SKILLS,
        experience: EXPERIENCE,
        education: EDUCATION,
        researchPapers: RESEARCH_PAPERS
    });
    
    // Seed Projects
    const projectsRef = collection(db, 'projects');
    for (const proj of PROJECTS) {
        await addDoc(projectsRef, proj);
    }
    console.log("Database seeded!");
};
