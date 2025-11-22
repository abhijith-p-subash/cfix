import { useState } from 'react';
import Header from '../components/Header';
import UsageIndicator from '../components/UsageIndicator';
import RoadmapGenerator from '../components/RoadmapGenerator';
import RoadmapDisplay from '../components/RoadmapDisplay';
import './Home.css';

const Home = () => {
    const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
    const [userInputs, setUserInputs] = useState(null);

    const handleRoadmapGenerated = (roadmap, inputs) => {
        setGeneratedRoadmap(roadmap);
        setUserInputs(inputs);

        // Scroll to roadmap display
        setTimeout(() => {
            document.getElementById('roadmap-result')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    return (
        <div className="home-page">
            <Header />

            <section className="hero-section section">
                <div className="container container-narrow">
                    <div className="hero-content">
                        <h1 className="hero-title fade-in">
                            Plan Your Career Journey with AI
                        </h1>
                        <p className="hero-description fade-in">
                            Get a personalized career roadmap powered by advanced AI. Transform your career aspirations into actionable steps with expert guidance tailored to your goals.
                        </p>
                        <div className="hero-features fade-in">
                            <div className="feature-item">
                                <span className="feature-icon">🎯</span>
                                <span>Personalized Roadmaps</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🚀</span>
                                <span>Actionable Steps</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📈</span>
                                <span>Career Growth</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="generator-section section">
                <div className="container container-narrow">
                    <UsageIndicator />
                    <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
                </div>
            </section>

            {generatedRoadmap && (
                <section id="roadmap-result" className="result-section section">
                    <div className="container container-narrow">
                        <RoadmapDisplay roadmap={generatedRoadmap} userInputs={userInputs} />
                    </div>
                </section>
            )}

            <footer className="footer">
                <div className="container">
                    <p>© 2024 CareerFix.AI - Powered by AI to build better careers</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
