import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import './RoadmapHistory.css';

const RoadmapHistory = ({ onSelectRoadmap, refreshTrigger }) => {
    const { user } = useAuth();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoadmaps = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch roadmaps for this user (removed orderBy to avoid composite index requirement)
                const q = query(
                    collection(db, 'roadmaps'),
                    where('userId', '==', user.uid),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const roadmapList = [];

                querySnapshot.forEach((doc) => {
                    roadmapList.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort by createdAt in JavaScript (since we can't use orderBy without index)
                roadmapList.sort((a, b) => {
                    const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
                    const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
                    return bTime - aTime; // Descending order (newest first)
                });

                // Limit to 10 after sorting
                setRoadmaps(roadmapList.slice(0, 10));
            } catch (err) {
                console.error('Error fetching roadmaps:', err);
                setError(`Failed to load history: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmaps();
    }, [user, refreshTrigger]); // Re-fetch when user changes or refreshTrigger updates

    if (!user) {
        return (
            <div className="roadmap-history">
                <div className="history-empty">
                    <p>📝 Sign in to view your roadmap history</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="roadmap-history">
                <div className="history-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your roadmaps...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="roadmap-history">
                <div className="history-error">
                    <p>❌ {error}</p>
                </div>
            </div>
        );
    }

    if (roadmaps.length === 0) {
        return (
            <div className="roadmap-history">
                <div className="history-empty">
                    <p>📝 No roadmaps yet. Generate your first one above!</p>
                </div>
            </div>
        );
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="roadmap-history">
            <h3 className="history-title">📚 Your Roadmap History</h3>

            <div className="history-list">
                {roadmaps.map((roadmap, index) => (
                    <div
                        key={roadmap.id}
                        className="history-item"
                        onClick={() => onSelectRoadmap(roadmap)}
                    >
                        <div className="history-item-header">
                            <span className="history-item-number">#{roadmaps.length - index}</span>
                            <span className="history-item-date">
                                {formatDate(roadmap.createdAt)}
                            </span>
                        </div>
                        <div className="history-item-content">
                            <h4 className="history-item-goal">
                                {roadmap.userInputs?.currentRole} → {roadmap.userInputs?.careerGoal}
                            </h4>
                            <p className="history-item-timeline">
                                ⏱️ {roadmap.userInputs?.timeline}
                            </p>
                        </div>
                        <div className="history-item-action">
                            <span className="view-link">View →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoadmapHistory;
