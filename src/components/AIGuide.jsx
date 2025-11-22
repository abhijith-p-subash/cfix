import { Lightbulb, HelpCircle } from 'lucide-react';
import TypewriterText from './TypewriterText';

const AIGuide = ({ focusedField }) => {
    const fieldHelp = {
        currentRole: {
            title: "Current Status",
            text: "Examples: Student, Graduate, Career Changer, Beginner, Junior Developer, etc."
        },
        careerGoal: {
            title: "Target Role",
            text: "Popular roles: Software Engineer, Data Scientist, UX Designer, Product Manager, DevOps Engineer"
        },
        skills: {
            title: "Your Skills",
            text: "List any skills (technical or soft skills). If you're just starting, you can write 'Beginner' or leave blank"
        },
        timeline: {
            title: "Time Commitment",
            text: "Choose based on how much time you can dedicate to learning"
        },
        additionalInfo: {
            title: "Extra Details",
            text: "Share your interests, constraints, or preferences (e.g., 'Interested in AI', 'Part-time only', 'Remote work preferred')"
        }
    };

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 h-full min-h-[200px]">
            <div className="flex items-center gap-2 mb-4 text-primary">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-semibold">AI Assistant Guide</h3>
            </div>

            {focusedField && fieldHelp[focusedField] ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                        {fieldHelp[focusedField].title}
                    </h4>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                        <TypewriterText text={fieldHelp[focusedField].text} speed={20} />
                    </div>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">
                    <p className="mb-4">
                        Fill out the form to get your personalized career roadmap.
                    </p>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                        <HelpCircle className="h-4 w-4" />
                        <span>Click on any field for tips!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIGuide;
