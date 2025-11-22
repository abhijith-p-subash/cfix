import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

const GUEST_STORAGE_KEY = 'careerfix_guest_usage';

/**
 * Get usage data for guest users (from localStorage)
 */
export const getGuestUsage = () => {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!stored) {
        return { count: 0, maxFree: 1 };
    }
    return JSON.parse(stored);
};

/**
 * Increment guest usage count
 */
export const incrementGuestUsage = () => {
    const usage = getGuestUsage();
    usage.count += 1;
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(usage));
    return usage;
};

/**
 * Check if guest has reached limit
 */
export const canGuestGenerate = () => {
    const usage = getGuestUsage();
    return usage.count < usage.maxFree;
};

/**
 * Get usage data for authenticated users (from Firestore)
 */
export const getUserUsage = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                count: data.roadmapCount || 0,
                maxFree: data.maxFreeRoadmaps || 2
            };
        }
        return { count: 0, maxFree: 2 };
    } catch (error) {
        console.error('Error getting user usage:', error);
        return { count: 0, maxFree: 2 };
    }
};

/**
 * Increment authenticated user's usage count
 */
export const incrementUserUsage = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            roadmapCount: increment(1)
        });

        // Return updated usage
        return await getUserUsage(userId);
    } catch (error) {
        console.error('Error incrementing user usage:', error);
        throw error;
    }
};

/**
 * Check if authenticated user can generate roadmap
 */
export const canUserGenerate = async (userId) => {
    const usage = await getUserUsage(userId);
    return usage.count < usage.maxFree;
};

/**
 * Get remaining generations
 */
export const getRemainingGenerations = async (user) => {
    if (!user) {
        const usage = getGuestUsage();
        return usage.maxFree - usage.count;
    }

    const usage = await getUserUsage(user.uid);
    return usage.maxFree - usage.count;
};
