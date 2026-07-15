import { db } from './firebase';
import { doc, getDoc, setDoc, increment, collection, getDocs, updateDoc } from 'firebase/firestore';

// ------------------------------------
// ANALYTICS OPERATIONS
// ------------------------------------

// Get today's date string (YYYY-MM-DD) for resetting daily stats
const getTodayString = () => new Date().toISOString().split('T')[0];

export const incrementVisitor = async () => {
    try {
        const statsRef = doc(db, 'portfolio', 'stats');
        const statsSnap = await getDoc(statsRef);
        
        const today = getTodayString();

        if (statsSnap.exists()) {
            const data = statsSnap.data();
            const updates = {
                totalVisitors: increment(1)
            };

            // If the last tracked day is different from today, reset daily visitors
            if (data.lastDate !== today) {
                updates.dailyVisitors = 1;
                updates.lastDate = today;
            } else {
                updates.dailyVisitors = increment(1);
            }
            await updateDoc(statsRef, updates);
        } else {
            // Initialize stats document
            await setDoc(statsRef, {
                totalVisitors: 1,
                dailyVisitors: 1,
                lastDate: today,
                totalTimeSpentMinutes: 0
            });
        }
    } catch (error) {
        console.error("Error incrementing visitor:", error);
    }
};

export const addTimeSpent = async (minutes) => {
    try {
        if (!minutes || minutes <= 0) return;
        const statsRef = doc(db, 'portfolio', 'stats');
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
            await updateDoc(statsRef, {
                totalTimeSpentMinutes: increment(minutes)
            });
        }
    } catch (error) {
        console.error("Error adding time spent:", error);
    }
};

export const getStats = async () => {
    try {
        const statsRef = doc(db, 'portfolio', 'stats');
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
            const data = statsSnap.data();
            
            // Check if daily visitors should be reset because of a new day
            const today = getTodayString();
            if (data.lastDate !== today) {
                return { ...data, dailyVisitors: 0 };
            }
            
            return data;
        }
    } catch (error) {
        console.error("Error getting stats:", error);
    }
    return { totalVisitors: 0, dailyVisitors: 0, totalTimeSpentMinutes: 0 };
};
