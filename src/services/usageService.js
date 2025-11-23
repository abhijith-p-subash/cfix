import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

import FingerprintJS from '@fingerprintjs/fingerprintjs';


const GUEST_COLLECTION = 'guest_usage';

/**
 * Get unique device fingerprint
 */
const getDeviceFingerprint = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
};

/**
 * Get public IP address
 */
const getPublicIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
        return 'unknown';
    }
};

/**
 * Get usage data for guest users (from Firestore via Fingerprint)
 */
export const getGuestUsage = async () => {
    try {
        const visitorId = await getDeviceFingerprint();
        const guestRef = doc(db, GUEST_COLLECTION, visitorId);
        const guestDoc = await getDoc(guestRef);

        if (guestDoc.exists()) {
            const data = guestDoc.data();
            return {
                count: data.count || 0,
                maxFree: data.maxFree || 1,
                visitorId
            };
        }

        return { count: 0, maxFree: 1, visitorId };
    } catch (error) {
        console.error('Error getting guest usage:', error);
        // Fallback to restrictive default on error
        return { count: 1, maxFree: 1 };
    }
};

/**
 * Increment guest usage count
 */
export const incrementGuestUsage = async () => {
    try {
        const visitorId = await getDeviceFingerprint();
        const ip = await getPublicIP();
        const guestRef = doc(db, GUEST_COLLECTION, visitorId);
        const guestDoc = await getDoc(guestRef);

        if (!guestDoc.exists()) {
            await setDoc(guestRef, {
                visitorId,
                count: 1,
                maxFree: 1,
                ipAddress: ip,
                userAgent: navigator.userAgent,
                firstUsed: serverTimestamp(),
                lastUsed: serverTimestamp()
            });
            return { count: 1, maxFree: 1 };
        }

        await updateDoc(guestRef, {
            count: increment(1),
            lastUsed: serverTimestamp(),
            ipAddress: ip, // Update IP to track changes
            userAgent: navigator.userAgent
        });

        return { count: (guestDoc.data().count || 0) + 1, maxFree: 1 };
    } catch (error) {
        console.error('Error incrementing guest usage:', error);
        throw error;
    }
};

/**
 * Check if guest has reached limit
 */
export const canGuestGenerate = async () => {
    const usage = await getGuestUsage();
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
                maxFree: data.maxFreeRoadmaps || 3
            };
        }
        return { count: 0, maxFree: 3 };
    } catch (error) {
        console.error('Error getting user usage:', error);
        return { count: 0, maxFree: 3 };
    }
};

/**
 * Increment authenticated user's usage count
 */
export const incrementUserUsage = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        // If user document doesn't exist, create it first
        if (!userDoc.exists()) {
            const { setDoc, serverTimestamp } = await import('firebase/firestore');
            const { auth } = await import('../config/firebase');
            const user = auth.currentUser;

            await setDoc(userRef, {
                uid: userId,
                email: user?.email || '',
                displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
                createdAt: serverTimestamp(),
                roadmapCount: 1,
                maxFreeRoadmaps: 3
            });

            return { count: 1, maxFree: 3 };
        }

        // Document exists, increment the count
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
        const usage = await getGuestUsage();
        return usage.maxFree - usage.count;
    }

    const usage = await getUserUsage(user.uid);
    return usage.maxFree - usage.count;
};

/**
 * Get resume usage data for guest users
 */
export const getGuestResumeUsage = async () => {
    try {
        const visitorId = await getDeviceFingerprint();
        const guestRef = doc(db, GUEST_COLLECTION, visitorId);
        const guestDoc = await getDoc(guestRef);

        if (guestDoc.exists()) {
            const data = guestDoc.data();
            return {
                count: data.resumeCount || 0,
                maxFree: data.maxFreeResumes || 1,
                visitorId
            };
        }

        return { count: 0, maxFree: 1, visitorId };
    } catch (error) {
        console.error('Error getting guest resume usage:', error);
        return { count: 1, maxFree: 1 };
    }
};

/**
 * Increment guest resume usage count
 */
export const incrementGuestResumeUsage = async () => {
    try {
        const visitorId = await getDeviceFingerprint();
        const ip = await getPublicIP();
        const guestRef = doc(db, GUEST_COLLECTION, visitorId);
        const guestDoc = await getDoc(guestRef);

        if (!guestDoc.exists()) {
            await setDoc(guestRef, {
                visitorId,
                count: 0, // Roadmap count
                maxFree: 1,
                resumeCount: 1,
                maxFreeResumes: 1,
                ipAddress: ip,
                userAgent: navigator.userAgent,
                firstUsed: serverTimestamp(),
                lastUsed: serverTimestamp()
            });
            return { count: 1, maxFree: 1 };
        }

        await updateDoc(guestRef, {
            resumeCount: increment(1),
            lastUsed: serverTimestamp(),
            ipAddress: ip,
            userAgent: navigator.userAgent
        });

        return { count: (guestDoc.data().resumeCount || 0) + 1, maxFree: 1 };
    } catch (error) {
        console.error('Error incrementing guest resume usage:', error);
        throw error;
    }
};

/**
 * Check if guest can generate resume review
 */
export const canGuestResumeGenerate = async () => {
    const usage = await getGuestResumeUsage();
    return usage.count < usage.maxFree;
};

/**
 * Get resume usage data for authenticated users
 */
export const getUserResumeUsage = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                count: data.resumeCount || 0,
                maxFree: data.maxFreeResumes || 2
            };
        }
        return { count: 0, maxFree: 2 };
    } catch (error) {
        console.error('Error getting user resume usage:', error);
        return { count: 0, maxFree: 2 };
    }
};

/**
 * Increment authenticated user's resume usage count
 */
export const incrementUserResumeUsage = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            const { setDoc, serverTimestamp } = await import('firebase/firestore');
            const { auth } = await import('../config/firebase');
            const user = auth.currentUser;

            await setDoc(userRef, {
                uid: userId,
                email: user?.email || '',
                displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
                createdAt: serverTimestamp(),
                roadmapCount: 0,
                maxFreeRoadmaps: 3,
                resumeCount: 1,
                maxFreeResumes: 2
            });

            return { count: 1, maxFree: 2 };
        }

        await updateDoc(userRef, {
            resumeCount: increment(1)
        });

        return await getUserResumeUsage(userId);
    } catch (error) {
        console.error('Error incrementing user resume usage:', error);
        throw error;
    }
};

/**
 * Check if authenticated user can generate resume review
 */
export const canUserResumeGenerate = async (userId) => {
    const usage = await getUserResumeUsage(userId);
    return usage.count < usage.maxFree;
};

/**
 * Get remaining resume generations
 */
export const getRemainingResumeGenerations = async (user) => {
    if (!user) {
        const usage = await getGuestResumeUsage();
        return usage.maxFree - usage.count;
    }

    const usage = await getUserResumeUsage(user.uid);
    return usage.maxFree - usage.count;
};
