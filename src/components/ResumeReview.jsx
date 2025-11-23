import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    canGuestResumeGenerate,
    incrementGuestResumeUsage,
    canUserResumeGenerate,
    incrementUserResumeUsage,
    getRemainingResumeGenerations
} from '../services/usageService';
import { reviewResume } from '../services/aiService';
import { generatePDF } from '../services/pdfService';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResumeReview = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState('');
    const [remaining, setRemaining] = useState(null);
    const [canGenerate, setCanGenerate] = useState(true);

    useEffect(() => {
        checkUsage();
    }, [user]);

    const checkUsage = async () => {
        const rem = await getRemainingResumeGenerations(user);
        setRemaining(rem);

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
        setReport('');

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

            // Increment usage
            if (user) {
                await incrementUserResumeUsage(user.uid);
            } else {
                await incrementGuestResumeUsage();
            }

            await checkUsage();

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to analyze resume.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!report) return;
        // We'll use a modified version of generatePDF or a new function for resumes
        // For now, passing dummy userInputs to reuse existing function or we will update pdfService
        const dummyInputs = {
            name: user?.displayName || (user ? 'User' : 'Guest'),
            currentRole: 'Resume Review',
            careerGoal: 'Career Improvement',
            skills: 'N/A',
            timeline: 'N/A'
        };

        // We might need to adapt generatePDF to handle "Resume Review" title specifically
        // But for now let's try to reuse it or I'll update pdfService next.
        await generatePDF(report, dummyInputs);
    };

    const MarkdownComponents = {
        h1: ({ node, ...props }) => <h1 className="mt-8 mb-4 text-2xl font-bold text-primary border-b pb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="mt-6 mb-3 text-xl font-semibold text-primary" {...props} />,
        h3: ({ node, ...props }) => <h3 className="mt-4 mb-2 text-lg font-medium text-foreground" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 text-muted-foreground leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-5 space-y-1 text-muted-foreground" {...props} />,
        ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-5 space-y-1 text-muted-foreground" {...props} />,
        li: ({ node, ...props }) => <li className="" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">AI Resume Review</h1>
                        <p className="text-muted-foreground mt-2">
                            Get detailed feedback, ATS scores, and salary estimates for your resume.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            {remaining !== null ? `${remaining} free reviews left` : 'Checking limits...'}
                        </div>
                    </div>
                </div>

                {!report ? (
                    <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Upload your Resume</h2>
                            <p className="text-muted-foreground mb-6">
                                Upload your resume in PDF or Text format to get an instant AI analysis.
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
                                            <span className="font-medium">{file.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Click to select file</span>
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
                                    You have reached your free limit. {user ? 'Please contact support for more.' : 'Sign in to get more free reviews.'}
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
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    'Analyze Resume'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-green-500/10 text-green-600 p-4 rounded-lg border border-green-500/20">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span className="font-medium">Analysis Complete!</span>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center text-sm font-medium hover:underline"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download Report
                            </button>
                        </div>

                        <div className="bg-card border rounded-xl p-8 shadow-sm roadmap-content">
                            <ReactMarkdown components={MarkdownComponents}>
                                {report}
                            </ReactMarkdown>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setReport('');
                                    setFile(null);
                                    checkUsage();
                                }}
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Analyze Another Resume
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeReview;
