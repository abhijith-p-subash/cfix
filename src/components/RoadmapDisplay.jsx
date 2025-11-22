import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generatePDF } from '../services/pdfService';
import './RoadmapDisplay.css';

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
                parts.push(<strong key={`bold-${key++}`}>{match[1]}</strong>);
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
                formatted.push(<br key={`br-${index}`} />);
            } else if (trimmed.startsWith('###')) {
                formatted.push(
                    <h4 key={index} className="roadmap-h4">
                        {parseInlineMarkdown(trimmed.replace(/^###\s*/, ''))}
                    </h4>
                );
            } else if (trimmed.startsWith('##')) {
                formatted.push(
                    <h3 key={index} className="roadmap-h3">
                        {parseInlineMarkdown(trimmed.replace(/^##\s*/, ''))}
                    </h3>
                );
            } else if (trimmed.startsWith('#')) {
                formatted.push(
                    <h2 key={index} className="roadmap-h2">
                        {parseInlineMarkdown(trimmed.replace(/^#\s*/, ''))}
                    </h2>
                );
            } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                formatted.push(
                    <li key={index} className="roadmap-li">
                        {parseInlineMarkdown(trimmed.replace(/^[-•*]\s*/, ''))}
                    </li>
                );
            } else {
                formatted.push(
                    <p key={index} className="roadmap-p">
                        {parseInlineMarkdown(trimmed)}
                    </p>
                );
            }
        });

        return formatted;
    };

    return (
        <div className="roadmap-display">
            <div className="roadmap-header">
                <div>
                    <h2>Your Career Roadmap</h2>
                    <p className="roadmap-subtitle">
                        From {userInputs.currentRole} to {userInputs.careerGoal}
                    </p>
                </div>

                <button
                    onClick={handleDownloadPDF}
                    className={`btn ${user ? 'btn-secondary' : 'btn-outline'}`}
                    disabled={!user || downloading}
                    title={!user ? 'Sign in to download PDF' : 'Download as PDF'}
                >
                    {downloading ? (
                        <>
                            <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            📄 Download PDF
                            {!user && <span className="locked-icon"> 🔒</span>}
                        </>
                    )}
                </button>
            </div>

            {!user && (
                <div className="pdf-restriction-notice">
                    <p>
                        🔒 PDF downloads are available for registered users. Sign up to save and download your roadmap!
                    </p>
                </div>
            )}

            <div className="roadmap-content">
                {formatRoadmap(roadmap)}
            </div>

            <div className="roadmap-footer">
                <p>
                    💡 <strong>Pro Tip:</strong> Save this roadmap and review it monthly to track your progress!
                </p>
            </div>
        </div>
    );
};

export default RoadmapDisplay;
