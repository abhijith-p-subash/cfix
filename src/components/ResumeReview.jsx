import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    canGuestResumeGenerate,
    incrementGuestResumeUsage,
    canUserResumeGenerate,
    incrementUserResumeUsage,
    getRemainingResumeGenerations
} from '../services/usageService';
import { reviewResume, saveResumeReview } from '../services/aiService';
import { generateResumePDF } from '../services/pdfService';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, Download, ArrowLeft, BarChart2, TrendingUp, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import UsageIndicator from './UsageIndicator';
import ResumeHistory from './ResumeHistory';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ResumeReview = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState(null); // Now expects JSON object
    const [refreshKey, setRefreshKey] = useState(0);
    const [canGenerate, setCanGenerate] = useState(true);

    useEffect(() => {
        checkUsage();
    }, [user, refreshKey]);

    const checkUsage = async () => {
        if (user) {
            const allowed = await canUserResumeGenerate(user.uid);
            setCanGenerate(allowed);
        } else {
            const allowed = await canGuestResumeGenerate();
            setCanGenerate(allowed);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please upload a PDF or Text file.');
        }
    };

    const extractTextFromPDF = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!canGenerate) {
            setError('You have reached your free limit for resume reviews.');
            return;
        }

        setLoading(true);
        setError('');
        setReport(null);

        try {
            let text = '';
            if (file.type === 'application/pdf') {
                text = await extractTextFromPDF(file);
            } else {
                text = await file.text();
            }

            if (!text.trim()) {
                throw new Error('Could not extract text from file. Please try another file.');
            }

            const analysis = await reviewResume(text);
            setReport(analysis);

            // Save to Firestore
            await saveResumeReview(user?.uid, analysis, file.name);

            // Increment usage
            if (user) {
                await incrementUserResumeUsage(user.uid);
            } else {
                await incrementGuestResumeUsage();
            }

            setRefreshKey(prev => prev + 1);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to analyze resume.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!report) return;
        if (!user) {
            setError('Please sign in to download the PDF report.');
            return;
        }

        const dummyInputs = {
            name: user.displayName || 'User',
        };

        await generateResumePDF(report, dummyInputs);
    };

    const handleSelectHistory = (resume) => {
        setReport(resume.content);
        setFile({ name: resume.fileName });
        // Scroll to top on mobile
        if (window.innerWidth < 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const ScoreCard = ({ title, score, icon: Icon, color }) => (
        <div className="bg-card border rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-2xl font-bold">{score}/100</p>
                </div>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color.includes('green') ? '#22c55e' : color.includes('blue') ? '#3b82f6' : color.includes('purple') ? '#a855f7' : '#f59e0b'}
                        strokeWidth="3"
                        strokeDasharray={`${score}, 100`}
                        className="animate-[dash_1s_ease-in-out_forwards]"
                    />
                </svg>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <UsageIndicator refreshTrigger={refreshKey} type="resume" />
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Left Column: Upload & Controls (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-2">Upload Resume</h2>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Upload your resume (PDF/TXT) for instant AI analysis.
                            </p>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="resume-upload"
                                    disabled={loading || !canGenerate}
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className={`block w-full border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                                        } ${(!canGenerate || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {file ? (
                                        <div className="flex items-center justify-center text-primary">
                                            <FileText className="w-6 h-6 mr-2" />
                                            <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground flex flex-col items-center">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground/50" />
                                            Click to select file
                                        </span>
                                    )}
                                </label>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            {!canGenerate && !error && (
                                <div className="mt-4 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg flex items-center justify-center text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Limit reached. {user ? 'Upgrade for more.' : 'Sign in for more.'}
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading || !canGenerate}
                                className="mt-6 w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze Resume'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Report Display (7 cols) */}
                    <div className="lg:col-span-7">
                        {report ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Scores Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ScoreCard
                                        title="Overall Score"
                                        score={report.scores.overall}
                                        icon={Award}
                                        color="bg-blue-500"
                                    />
                                    <ScoreCard
                                        title="Impact"
                                        score={report.scores.impact}
                                        icon={TrendingUp}
                                        color="bg-green-500"
                                    />
                                    <ScoreCard
                                        title="ATS Friendly"
                                        score={report.scores.ats}
                                        icon={CheckCircle}
                                        color="bg-purple-500"
                                    />
                                    <ScoreCard
                                        title="Content Quality"
                                        score={report.scores.content}
                                        icon={BookOpen}
                                        color="bg-yellow-500"
                                    />
                                </div>

                                {/* Main Report */}
                                <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">Analysis Report</h2>
                                            <p className="text-muted-foreground text-sm mt-1">{report.summary}</p>
                                        </div>

                                        {user ? (
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download PDF
                                            </button>
                                        ) : (
                                            <div className="group relative">
                                                <button
                                                    disabled
                                                    className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-70"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download PDF
                                                </button>
                                                <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 border">
                                                    Sign in to download the full PDF report!
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="border-border" />

                                    {/* Detailed Analysis */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="bg-secondary/30 p-4 rounded-lg">
                                                <h4 className="font-medium text-sm mb-1">Formatting</h4>
                                                <p className="text-sm text-muted-foreground">{report.detailedAnalysis.formatting}</p>
                                            </div>
                                            <div className="bg-secondary/30 p-4 rounded-lg">
                                                <h4 className="font-medium text-sm mb-1">Content Quality</h4>
                                                <p className="text-sm text-muted-foreground">{report.detailedAnalysis.content}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ATS Optimization */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">ATS Optimization</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm font-medium text-green-600">Keywords Found: </span>
                                                <span className="text-sm text-muted-foreground">{report.atsOptimization.keywordsFound.join(', ')}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-red-500">Missing Keywords: </span>
                                                <span className="text-sm text-muted-foreground">{report.atsOptimization.missingKeywords.join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Value Assessment */}
                                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                        <h3 className="text-lg font-semibold mb-2 text-primary">Value Assessment</h3>
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Est. Salary Range</p>
                                                <p className="text-lg font-bold">{report.valueAssessment.salaryRange}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Market Demand</p>
                                                <p className="text-lg font-bold">{report.valueAssessment.marketDemand}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Improvements */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Actionable Improvements</h3>
                                        <ul className="space-y-2">
                                            {report.improvements.map((item, i) => (
                                                <li key={i} className="flex items-start text-sm text-muted-foreground">
                                                    <span className="mr-2 mt-1 text-primary">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex h-full min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
                                <div>
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                    <h3 className="text-lg font-semibold mb-2">Ready to Review?</h3>
                                    <p>Upload your resume on the left to get a detailed analysis.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Section (Full Width) */}
                    <div className="lg:col-span-12 mt-8">
                        <ResumeHistory
                            onSelectResume={handleSelectHistory}
                            refreshTrigger={refreshKey}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeReview;
