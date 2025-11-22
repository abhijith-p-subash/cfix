import { useState } from 'react';
import Header from '../components/Header';
import UsageIndicator from '../components/UsageIndicator';
import RoadmapGenerator from '../components/RoadmapGenerator';
import RoadmapDisplay from '../components/RoadmapDisplay';
import RoadmapHistory from '../components/RoadmapHistory';
import { Target, Rocket, TrendingUp } from 'lucide-react';

const Home = () => {
    const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
    const [userInputs, setUserInputs] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRoadmapGenerated = (roadmap, inputs) => {
        setGeneratedRoadmap(roadmap);
        setUserInputs(inputs);

        // Trigger usage indicator refresh
        setRefreshKey(prev => prev + 1);

        // Scroll to roadmap display
        setTimeout(() => {
            document.getElementById('roadmap-result')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    const handleSelectHistoryRoadmap = (roadmap) => {
        setGeneratedRoadmap(roadmap.content);
        setUserInputs(roadmap.userInputs);

        // Scroll to roadmap display
        setTimeout(() => {
            document.getElementById('roadmap-result')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Header />

            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Plan Your Career <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Journey with AI
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                            Get a personalized career roadmap powered by advanced AI. Transform your career aspirations into actionable steps with expert guidance tailored to your goals.
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Target className="h-4 w-4" />
                                </div>
                                <span>Personalized Roadmaps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Rocket className="h-4 w-4" />
                                </div>
                                <span>Actionable Steps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span>Career Growth</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <UsageIndicator refreshTrigger={refreshKey} />
                    <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
                    <RoadmapHistory
                        onSelectRoadmap={handleSelectHistoryRoadmap}
                        refreshTrigger={refreshKey}
                    />
                </div>
            </section>

            {generatedRoadmap && (
                <section id="roadmap-result" className="pb-20">
                    <div className="container mx-auto px-4">
                        <RoadmapDisplay roadmap={generatedRoadmap} userInputs={userInputs} />
                    </div>
                </section>
            )}

            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
                <div className="container mx-auto px-4">
                    <p>© 2024 CareerFix.AI - Powered by AI to build better careers</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
