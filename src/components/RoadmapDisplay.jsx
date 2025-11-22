import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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

    // ReactMarkdown handles the rendering now, so we don't need manual formatting
    // But we can keep a wrapper or custom components if needed
    const MarkdownComponents = {
        h1: ({ node, ...props }) => <h1 className="mt-10 mb-6 text-3xl font-bold text-primary" {...props} />,
        h2: ({ node, ...props }) => <h2 className="mt-8 mb-4 text-2xl font-bold text-primary" {...props} />,
        h3: ({ node, ...props }) => <h3 className="mt-6 mb-3 text-xl font-semibold text-foreground border-b pb-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="mt-4 mb-2 text-lg font-semibold text-foreground" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
        ul: ({ node, ...props }) => <ul className="mb-4 ml-6 list-disc marker:text-primary" {...props} />,
        ol: ({ node, ...props }) => <ol className="mb-4 ml-6 list-decimal marker:text-primary" {...props} />,
        li: ({ node, ...props }) => <li className="mb-2 pl-1 text-muted-foreground" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4" {...props} />,
    };

    return (
        <div className="w-full max-w-4xl mx-auto rounded-xl border bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b p-4 ">
                <div className='flex flex-col justify-between w-full sm:flex-row sm:items-center'>
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
                    <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <Lock className="h-4 w-4" />
                        <p>
                            PDF downloads are available for registered users. Sign up to save and download your roadmap!
                        </p>
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">


                <div className="space-y-1">
                    <ReactMarkdown components={MarkdownComponents}>
                        {roadmap}
                    </ReactMarkdown>
                </div>

                <div className="mt-8 rounded-lg bg-primary/5 p-4 text-sm text-primary border border-primary/10">
                    <p className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        Pro Tip: Save this roadmap and review it monthly to track your progress!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoadmapDisplay;
