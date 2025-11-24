import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Trigger fade out after a brief moment
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div className="flex flex-col items-center space-y-6">
                {/* Animated Logo/Spinner */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 animate-spin-slow">
                        <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary"></div>
                    </div>

                    {/* Inner icon */}
                    <div className="flex h-24 w-24 items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                </div>

                {/* Loading Text */}
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        CareerFix.AI
                    </h2>
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Loading your career journey...
                    </p>
                </div>

                {/* Progress indicator dots */}
                <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
