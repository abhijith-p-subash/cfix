import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <Header />

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-2xl mx-auto">
                    {/* 404 Number */}
                    <div className="mb-8">
                        <h1 className="text-9xl font-extrabold text-primary/20">404</h1>
                    </div>

                    {/* Message */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </button>
                    </div>

                    {/* Helpful Links */}
                    <div className="mt-12 pt-8 border-t">
                        <p className="text-sm text-muted-foreground mb-4">You might be looking for:</p>
                        <div className="flex flex-wrap gap-4 justify-center text-sm">
                            <Link to="/create" className="text-primary hover:underline">
                                Create Roadmap
                            </Link>
                            <Link to="/resume-review" className="text-primary hover:underline">
                                Resume Review
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default NotFound;
