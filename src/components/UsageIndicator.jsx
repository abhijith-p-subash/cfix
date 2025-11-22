import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRemainingGenerations } from '../services/usageService';
import './UsageIndicator.css';

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

    return (
        <div className="usage-indicator">
            <div className="usage-header">
                <span className="usage-label">
                    {user ? '🎯 Free Roadmaps' : '🎁 Trial Roadmap'}
                </span>
                <span className="usage-count">
                    {remaining} of {maxGenerations} remaining
                </span>
            </div>

            <div className="usage-bar">
                <div
                    className="usage-bar-fill"
                    style={{ width: `${(usedGenerations / maxGenerations) * 100}%` }}
                />
            </div>

            {!user && remaining > 0 && (
                <p className="usage-hint">
                    💡 Sign up to get 2 free roadmaps with PDF downloads!
                </p>
            )}

            {remaining === 0 && (
                <div className="usage-limit-message">
                    <p>
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
