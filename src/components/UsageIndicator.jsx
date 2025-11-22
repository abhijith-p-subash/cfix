import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRemainingGenerations } from '../services/usageService';
import * as Progress from '@radix-ui/react-progress';

const UsageIndicator = ({ refreshTrigger }) => {
    const { user } = useAuth();
    const [remaining, setRemaining] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRemaining = async () => {
            try {
                const count = await getRemainingGenerations(user);
                setRemaining(count);
            } catch (error) {
                console.error('Error fetching usage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRemaining();
    }, [user, refreshTrigger]); // Re-fetch when refreshTrigger changes

    if (loading) return null;

    const maxGenerations = user ? 2 : 1;
    const usedGenerations = maxGenerations - remaining;
    const percentage = (usedGenerations / maxGenerations) * 100;

    return (
        <div className="mb-8 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                    {user ? '🎯 Free Roadmaps' : '🎁 Trial Roadmap'}
                </span>
                <span className="text-muted-foreground">
                    {remaining} of {maxGenerations} remaining
                </span>
            </div>

            <Progress.Root
                className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
                value={percentage}
            >
                <Progress.Indicator
                    className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out"
                    style={{ transform: `translateX(-${100 - percentage}%)` }}
                />
            </Progress.Root>

            {!user && remaining > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                    💡 Sign up to get 2 free roadmaps with PDF downloads!
                </p>
            )}

            {remaining === 0 && (
                <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                    <p className="text-center font-medium text-foreground">
                        {user
                            ? "🎉 You've used your free roadmap generations. Loving it? Upgrade for unlimited access!"
                            : "🚀 Sign up to get 2 more free roadmaps with PDF downloads!"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default UsageIndicator;
