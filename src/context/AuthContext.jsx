import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';
import { migrateGuestRoadmaps } from '../services/migrationService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                // User just logged in - migrate any guest roadmaps
                try {
                    await migrateGuestRoadmaps(user.uid);
                } catch (error) {
                    console.error('Error during roadmap migration:', error);
                }
            }
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
