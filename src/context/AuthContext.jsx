import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';
import { migrateGuestRoadmaps, migrateGuestResumes } from '../services/migrationService';
import { useToast } from './ToastContext';
import LoadingScreen from '../components/LoadingScreen';

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
    const { showError } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                // User just logged in - migrate any guest data
                try {
                    await Promise.all([
                        migrateGuestRoadmaps(user.uid),
                        migrateGuestResumes(user.uid)
                    ]);
                } catch (error) {
                    console.error('Error during migration:', error);
                    showError(
                        'Migration Notice',
                        'Some of your guest data could not be migrated. Your new data will be saved normally.'
                    );
                }
            }
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [showError]);

    const value = {
        user,
        loading
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
