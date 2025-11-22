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
