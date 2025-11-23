import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { History, FileText, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const ResumeHistory = ({ onSelectResume, refreshTrigger }) => {
    const { user } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResumes = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, 'resumes'),
                    where('userId', '==', user.uid),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const resumeList = [];

                querySnapshot.forEach((doc) => {
                    resumeList.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort by createdAt desc
                resumeList.sort((a, b) => {
                    const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
                    const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
                    return bTime - aTime;
                });

                setResumes(resumeList.slice(0, 10));
            } catch (err) {
                console.error('Error fetching resume history:', err);
                setError(`Failed to load history: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, [user, refreshTrigger]);

    if (!user) {
        return (
            <div className="mt-12 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No History Yet</h3>
                <p className="mt-2 text-muted-foreground">Sign in to view your resume review history</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mt-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-12 rounded-md bg-destructive/15 p-4 text-center text-destructive">
                <p>❌ {error}</p>
            </div>
        );
    }

    if (resumes.length === 0) {
        return (
            <div className="mt-12 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Reviews Yet</h3>
                <p className="mt-2 text-muted-foreground">Upload your first resume above!</p>
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
        <div className="w-full mx-auto">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <History className="h-5 w-5" />
                Resume Review History
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
                {resumes.map((resume, index) => (
                    <div
                        key={resume.id}
                        className="group relative cursor-pointer rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                        onClick={() => onSelectResume(resume)}
                    >
                        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-medium text-primary">#{resumes.length - index}</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(resume.createdAt)}
                            </span>
                        </div>

                        <h4 className="mb-2 font-semibold leading-tight group-hover:text-primary truncate">
                            {resume.fileName || 'Resume Review'}
                        </h4>

                        <div className="flex items-center justify-between">
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                Score: {resume.content?.scores?.overall || 'N/A'}
                            </p>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumeHistory;
