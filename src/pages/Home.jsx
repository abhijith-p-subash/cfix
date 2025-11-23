// Updated Home.jsx with improved centering and responsiveness
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Map, FileText, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen w-full items-center text-center">
            <Header />

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-background w-full flex justify-center">
                <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
                    <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20">
                            ✨ The Ultimate AI-Powered Career Accelerator
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Master Your Career Journey with AI Precision
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-[800px]">
                            Stop guessing. Start growing. CareerFixAI combines advanced AI roadmaps with professional resume analysis to give you the complete toolkit for career success.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            <Link
                                to="/create"
                                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                            >
                                Build Your Roadmap
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>

                            <Link
                                to="/resume-review"
                                className="inline-flex items-center justify-center rounded-lg border bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                Analyze Resume
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
            </section>

            {/* Features */}
            <section className="py-20 bg-secondary/30 w-full flex justify-center">
                <div className="container px-4 md:px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Your Complete Career Toolkit</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
                        Everything you need to plan, prepare, and progress in your career, powered by state-of-the-art AI.
                    </p>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 place-items-center">
                        {/* Feature 1 */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md w-full max-w-sm">
                            <div className="h-12 w-12 mx-auto rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <Map className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">AI Career Roadmaps</h3>
                            <p className="text-muted-foreground">
                                Get a personalized, step-by-step plan to reach your dream role.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md w-full max-w-sm">
                            <div className="h-12 w-12 mx-auto rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Resume Analysis</h3>
                            <p className="text-muted-foreground">
                                Deep, actionable recommendations to improve your resume.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md w-full max-w-sm">
                            <div className="h-12 w-12 mx-auto rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Goal Tracking</h3>
                            <p className="text-muted-foreground">
                                Track progress, complete milestones, and stay consistent.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-background border-y w-full flex justify-center">
                <div className="container px-4 md:px-6 grid gap-8 md:grid-cols-3 text-center">
                    <div>
                        <div className="text-4xl font-bold text-primary">100%</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">AI Powered</div>
                    </div>

                    <div>
                        <div className="text-4xl font-bold text-primary">24/7</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Instant Feedback</div>
                    </div>

                    <div>
                        <div className="text-4xl font-bold text-primary">Secure</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Private & Confidential</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary text-primary-foreground w-full text-center">
                <div className="px-4 md:px-6">
                    <h2 className="text-3xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
                    <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10 text-lg">
                        Join thousands of professionals upgrading their careers with CareerFixAI.
                    </p>

                    {!user && (
                        <Link
                            to="/create"
                            className="inline-flex items-center justify-center rounded-lg bg-background text-primary px-8 py-3 text-sm font-bold shadow hover:bg-background/90"
                        >
                            Get Started for Free
                        </Link>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
