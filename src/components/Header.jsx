import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/authService';
import AuthModal from './AuthModal';
import './Header.css';

const Header = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('signin');

    const handleSignOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    return (
        <>
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <h1 className="logo-text">
                                <span className="logo-primary">Career</span>
                                <span className="logo-secondary">Fix</span>
                                <span className="logo-ai">.AI</span>
                            </h1>
                        </div>

                        <nav className="nav">
                            {user ? (
                                <div className="user-section">
                                    <div className="user-info">
                                        <span className="user-icon">👤</span>
                                        <span className="user-name">{user.displayName || user.email}</span>
                                    </div>
                                    <button onClick={handleSignOut} className="btn btn-outline btn-sm">
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <button onClick={() => openAuthModal('signin')} className="btn btn-ghost btn-sm">
                                        Sign In
                                    </button>
                                    <button onClick={() => openAuthModal('signup')} className="btn btn-primary btn-sm">
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                />
            )}
        </>
    );
};

export default Header;
