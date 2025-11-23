import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Migrate guest roadmaps to authenticated user
 * This should be called after a user logs in
 */
export const migrateGuestRoadmaps = async (userId) => {
    try {
        // Get guest ID from localStorage (we'll use a consistent guest ID)
        const guestId = localStorage.getItem('careerfix_guest_id') || 'guest';

        // Find all roadmaps created by this guest
        const q = query(
            collection(db, 'roadmaps'),
            where('userId', '==', guestId)
        );

        const querySnapshot = await getDocs(q);

        // Update each guest roadmap to the new user ID
        const updatePromises = [];
        querySnapshot.forEach((docSnapshot) => {
            const roadmapRef = doc(db, 'roadmaps', docSnapshot.id);
            updatePromises.push(
                updateDoc(roadmapRef, {
                    userId: userId,
                    migratedFromGuest: true
                })
            );
        });

        await Promise.all(updatePromises);

        // Clear guest roadmap tracking from localStorage
        localStorage.removeItem('careerfix_guest_id');

        console.log(`Migrated ${querySnapshot.size} guest roadmaps to user ${userId}`);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error migrating guest roadmaps:', error);
        // Don't throw - migration failure shouldn't break login
        return 0;
    }
};

/**
 * Migrate guest resume reviews to authenticated user
 */
export const migrateGuestResumes = async (userId) => {
    try {
        const guestId = localStorage.getItem('careerfix_guest_id') || 'guest';

        // Find all resumes created by this guest
        const q = query(
            collection(db, 'resumes'),
            where('userId', '==', guestId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return 0;
        }

        // Update each guest resume to the new user ID
        const updatePromises = [];
        querySnapshot.forEach((docSnapshot) => {
            const resumeRef = doc(db, 'resumes', docSnapshot.id);
            updatePromises.push(
                updateDoc(resumeRef, {
                    userId: userId,
                    migratedFromGuest: true
                })
            );
        });

        await Promise.all(updatePromises);

        // Increment user's resume usage count by the number of migrated resumes
        const { incrementUserResumeUsage } = await import('./usageService');
        // We need to manually increment by the count, but incrementUserResumeUsage only increments by 1.
        // So we'll do a loop or update directly. Updating directly is safer here to avoid multiple reads.
        // However, to keep it simple and reuse logic, we can just update the user doc directly here.

        const { increment } = await import('firebase/firestore');
        const userRef = doc(db, 'users', userId);

        // Ensure user doc exists (incrementUserResumeUsage handles creation, but we might need to do it here if it doesn't exist)
        // Actually, let's use a direct update with increment. If doc doesn't exist, we might lose other fields if we use set,
        // but update fails if doc doesn't exist.
        // Safest is to use incrementUserResumeUsage in a loop, OR just update the doc if we know the user is logged in (which they are).
        // But wait, incrementUserResumeUsage also sets maxFreeResumes if creating.

        // Let's try to update directly, assuming AuthContext ensures user exists or will be created.
        // Actually, let's just use updateDoc with increment. If the user doc doesn't exist yet (new user), 
        // we should probably create it. 

        // Let's use setDoc with merge to be safe
        const { setDoc, serverTimestamp } = await import('firebase/firestore');
        await setDoc(userRef, {
            resumeCount: increment(querySnapshot.size),
            // Ensure defaults are set if this is the first interaction
            maxFreeResumes: 2
        }, { merge: true });

        console.log(`Migrated ${querySnapshot.size} guest resumes to user ${userId}`);
        return querySnapshot.size;

    } catch (error) {
        console.error('Error migrating guest resumes:', error);
        return 0;
    }
};

/**
 * Generate or get a consistent guest ID
 */
export const getGuestId = () => {
    let guestId = localStorage.getItem('careerfix_guest_id');

    if (!guestId) {
        // Generate a unique guest ID
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('careerfix_guest_id', guestId);
    }

    return guestId;
};
