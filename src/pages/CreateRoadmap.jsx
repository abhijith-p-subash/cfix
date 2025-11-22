import { useState } from 'react';
import Header from '../components/Header';
import UsageIndicator from '../components/UsageIndicator';
import RoadmapGenerator from '../components/RoadmapGenerator';
import RoadmapDisplay from '../components/RoadmapDisplay';
import RoadmapHistory from '../components/RoadmapHistory';
import AIGuide from '../components/AIGuide';

const CreateRoadmap = () => {
    const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
    const [userInputs, setUserInputs] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [focusedField, setFocusedField] = useState(null);

    const handleRoadmapGenerated = (roadmap, inputs) => {
        setGeneratedRoadmap(roadmap);
        setUserInputs(inputs);
        setRefreshKey(prev => prev + 1);

        // Scroll to top on mobile to see result, on desktop it's in the side panel
        if (window.innerWidth < 768) {
            setTimeout(() => {
                document.getElementById('roadmap-result')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    };

    const handleSelectHistoryRoadmap = (roadmap) => {
        setGeneratedRoadmap(roadmap.content);
        setUserInputs(roadmap.userInputs);

        if (window.innerWidth < 768) {
            setTimeout(() => {
                document.getElementById('roadmap-result')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-8">
                    <UsageIndicator refreshTrigger={refreshKey} />
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Left Column: Form (7 cols) */}
                    <div className="lg:col-span-7 space-y-8">
                        <RoadmapGenerator
                            onRoadmapGenerated={handleRoadmapGenerated}
                            onFocusChange={setFocusedField}
                        />

                        <div className="pt-10 border-t">
                            <RoadmapHistory
                                onSelectRoadmap={handleSelectHistoryRoadmap}
                                refreshTrigger={refreshKey}
                            />
                        </div>
                    </div>

                    {/* Right Column: Sticky Guide / Result (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            {generatedRoadmap ? (
                                <section id="roadmap-result" className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                                        <RoadmapDisplay roadmap={generatedRoadmap} userInputs={userInputs} />
                                    </div>
                                </section>
                            ) : (
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <AIGuide focusedField={focusedField} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoadmap;
