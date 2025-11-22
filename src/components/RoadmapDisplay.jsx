import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generatePDF } from '../services/pdfService';
import { Download, Lock, FileText, Loader2 } from 'lucide-react';

const RoadmapDisplay = ({ roadmap, userInputs }) => {
    const { user } = useAuth();
    const [downloading, setDownloading] = useState(false);
    const [lastDownloadTime, setLastDownloadTime] = useState(0);

    const handleDownloadPDF = async () => {
        if (!user) {
            alert('Please sign in to download your roadmap as PDF');
            return;
        }

        // Debounce: prevent multiple clicks within 2 seconds
        const now = Date.now();
        const timeSinceLastDownload = now - lastDownloadTime;

        if (downloading) {
            return; // Already downloading
        }

        if (timeSinceLastDownload < 2000) {
            alert('⏳ Please wait a moment before downloading again.');
            return;
        }

        setDownloading(true);
        setLastDownloadTime(now);

        try {
            await generatePDF(roadmap, userInputs);
        } catch (error) {
            alert('Failed to generate PDF. Please try again.');
        } finally {
            // Keep downloading state for at least 1 second to prevent rapid re-clicks
            setTimeout(() => {
                setDownloading(false);
            }, 1000);
        }
    };

    // Convert markdown-style formatting to HTML with proper bold/italic handling
    const formatRoadmap = (text) => {
        const lines = text.split('\n');
        let formatted = [];

        // Helper function to convert inline markdown to JSX
        const parseInlineMarkdown = (text) => {
            const parts = [];
            let currentText = text;
            let key = 0;

            // Parse bold (**text**)
            const boldRegex = /\*\*(.+?)\*\*/g;
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(currentText)) !== null) {
                // Add text before the match
                if (match.index > lastIndex) {
                    parts.push(currentText.substring(lastIndex, match.index));
                }
                // Add bold text
                parts.push(<strong key={`bold-${key++}`} className="font-semibold text-foreground">{match[1]}</strong>);
                lastIndex = match.index + match[0].length;
            }

            // Add remaining text
            if (lastIndex < currentText.length) {
                parts.push(currentText.substring(lastIndex));
            }

            return parts.length > 0 ? parts : currentText;
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (!trimmed) {
                formatted.push(<div key={`br-${index}`} className="h-4" />);
            } else if (trimmed.startsWith('###')) {
                formatted.push(
                    <h4 key={index} className="mt-6 mb-2 text-lg font-semibold text-primary">
                        {parseInlineMarkdown(trimmed.replace(/^###\s*/, ''))}
                    </h4>
                );
            } else if (trimmed.startsWith('##')) {
                formatted.push(
                    <h3 key={index} className="mt-8 mb-4 text-xl font-bold text-foreground border-b pb-2">
                        {parseInlineMarkdown(trimmed.replace(/^##\s*/, ''))}
                    </h3>
                );
            } else if (trimmed.startsWith('#')) {
                formatted.push(
                    <h2 key={index} className="mt-10 mb-6 text-2xl font-bold text-primary">
                        {parseInlineMarkdown(trimmed.replace(/^#\s*/, ''))}
                    </h2>
                );
            } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                formatted.push(
                    <li key={index} className="ml-4 list-disc marker:text-primary mb-2 pl-1 text-muted-foreground">
                        {parseInlineMarkdown(trimmed.replace(/^[-•*]\s*/, ''))}
                    </li>
                );
            } else {
                formatted.push(
                    <p key={index} className="mb-4 leading-relaxed text-muted-foreground">
                        {parseInlineMarkdown(trimmed)}
                    </p>
                );
            }
        });

        return formatted;
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 rounded-xl border bg-card p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Career Roadmap</h2>
                    <p className="text-muted-foreground mt-1">
                        From <span className="font-medium text-foreground">{userInputs.currentRole}</span> to <span className="font-medium text-foreground">{userInputs.careerGoal}</span>
                    </p>
                </div>

                <button
                    onClick={handleDownloadPDF}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${user
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                        }`}
                    disabled={!user || downloading}
                    title={!user ? 'Sign in to download PDF' : 'Download as PDF'}
                >
                    {downloading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                            {!user && <Lock className="ml-2 h-3 w-3 text-muted-foreground" />}
                        </>
                    )}
                </button>
            </div>

            {!user && (
                <div className="mb-6 rounded-md bg-muted p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <p>
                        PDF downloads are available for registered users. Sign up to save and download your roadmap!
                    </p>
                </div>
            )}

            <div className="space-y-1">
                {formatRoadmap(roadmap)}
            </div>

            <div className="mt-8 rounded-lg bg-primary/5 p-4 text-sm text-primary border border-primary/10">
                <p className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4" />
                    Pro Tip: Save this roadmap and review it monthly to track your progress!
                </p>
            </div>
        </div>
    );
};

export default RoadmapDisplay;
