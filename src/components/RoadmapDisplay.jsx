import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generatePDF } from '../services/pdfService';
import './RoadmapDisplay.css';

const RoadmapDisplay = ({ roadmap, userInputs }) => {
    const { user } = useAuth();
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!user) {
            alert('Please sign in to download your roadmap as PDF');
            return;
        }

        setDownloading(true);
        try {
            await generatePDF(roadmap, userInputs);
        } catch (error) {
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // Convert markdown-style formatting to HTML
    const formatRoadmap = (text) => {
        const lines = text.split('\n');
        let formatted = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (!trimmed) {
                formatted.push(<br key={`br-${index}`} />);
            } else if (trimmed.startsWith('###')) {
                formatted.push(
                    <h4 key={index} className="roadmap-h4">
                        {trimmed.replace(/^###\s*/, '')}
                    </h4>
                );
            } else if (trimmed.startsWith('##')) {
                formatted.push(
                    <h3 key={index} className="roadmap-h3">
                        {trimmed.replace(/^##\s*/, '')}
                    </h3>
                );
            } else if (trimmed.startsWith('#')) {
                formatted.push(
                    <h2 key={index} className="roadmap-h2">
                        {trimmed.replace(/^#\s*/, '')}
                    </h2>
                );
            } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                formatted.push(
                    <li key={index} className="roadmap-li">
                        {trimmed.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '')}
                    </li>
                );
            } else {
                formatted.push(
                    <p key={index} className="roadmap-p">
                        {trimmed.replace(/\*\*/g, '')}
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
