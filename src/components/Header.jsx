import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/authService';
import AuthModal from './AuthModal';
import { User, LogOut, Menu, X } from 'lucide-react';

const Header = () => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('signin');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await logOut();
            setMobileMenuOpen(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={closeMobileMenu}>
                            <h1 className="text-xl font-bold tracking-tight">
                                <span className="text-primary">CareerFix</span>
                                <span className="text-foreground">AI</span>
                            </h1>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link to="/create" className="text-foreground/60 transition-colors hover:text-foreground/80">
                                Create Roadmap
                            </Link>
                            <Link to="/resume-review" className="text-foreground/60 transition-colors hover:text-foreground/80">
                                Resume Review
                            </Link>
                        </nav>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <nav className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline-block">{user.displayName || user.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openAuthModal('signin')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => openAuthModal('signup')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-background">
                        <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            <Link
                                to="/create"
                                className="text-foreground/80 hover:text-foreground font-medium py-2"
                                onClick={closeMobileMenu}
                            >
                                Create Roadmap
                            </Link>
                            <Link
                                to="/resume-review"
                                className="text-foreground/80 hover:text-foreground font-medium py-2"
                                onClick={closeMobileMenu}
                            >
                                Resume Review
                            </Link>

                            <div className="border-t pt-4 mt-2">
                                {user ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{user.displayName || user.email}</span>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => openAuthModal('signin')}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full border"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => openAuthModal('signup')}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
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
