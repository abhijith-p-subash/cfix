import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    canGuestGenerate,
    incrementGuestUsage,
    canUserGenerate,
    incrementUserUsage
} from '../services/usageService';
import { generateCareerRoadmap, saveRoadmap } from '../services/aiService';
import { Sparkles, Loader2 } from 'lucide-react';

const RoadmapGenerator = ({ onRoadmapGenerated, onFocusChange }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        currentRole: '',
        careerGoal: '',
        skills: '',
        timeline: '',
        additionalInfo: ''
    });
    const [lastSubmittedData, setLastSubmittedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user changes form
        if (error) setError('');
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
        if (onFocusChange) onFocusChange(fieldName);
    };

    const handleBlur = () => {
        setFocusedField(null);
        if (onFocusChange) onFocusChange(null);
    };

    // Check if current form data is identical to last submission
    const isDuplicate = () => {
        if (!lastSubmittedData) return false;

        return (
            lastSubmittedData.currentRole === formData.currentRole &&
            lastSubmittedData.careerGoal === formData.careerGoal &&
            lastSubmittedData.skills === formData.skills &&
            lastSubmittedData.timeline === formData.timeline &&
            lastSubmittedData.additionalInfo === formData.additionalInfo
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check for duplicate submission
        if (isDuplicate()) {
            setError('⚠️ You already generated a roadmap with this exact data. Try modifying your inputs to create a new roadmap!');
            return;
        }

        setLoading(true);

        try {
            // Check usage limits
            const canGenerate = user
                ? await canUserGenerate(user.uid)
                : await canGuestGenerate();

            if (!canGenerate) {
                setError(
                    user
                        ? "You've reached your free generation limit. Upgrade to continue!"
                        : "You've used your free trial. Please sign up to get 2 more free roadmaps!"
                );
                setLoading(false);
                return;
            }

            // Prepare data with name
            const submissionData = {
                ...formData,
                name: user ? (user.displayName || 'User') : (formData.name || 'Guest')
            };

            // Generate roadmap
            const roadmap = await generateCareerRoadmap(submissionData);

            // Increment usage counter
            if (user) {
                await incrementUserUsage(user.uid);
            } else {
                await incrementGuestUsage();
            }

            // Save roadmap to Firestore
            await saveRoadmap(user?.uid, roadmap, submissionData);

            // Store submitted data to prevent duplicates
            setLastSubmittedData({ ...formData });

            // Pass roadmap to parent component
            onRoadmapGenerated(roadmap, submissionData);

        } catch (err) {
            setError(err.message || 'Failed to generate roadmap. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fieldHelp = {
        name: {
            title: "Your Name",
            text: "Enter your name so we can personalize your roadmap PDF!"
        },
        currentRole: {
            title: "Current Status",
            text: "Examples: Student, Graduate, Career Changer, Beginner, Junior Developer, etc."
        },
        careerGoal: {
            title: "Dream Goal",
            text: "Popular roles: Software Engineer, Data Scientist, UX Designer, Product Manager, DevOps Engineer"
        },
        skills: {
            title: "Your Skills",
            text: "List any skills (technical or soft skills). If you're just starting, you can write 'Beginner' or leave blank"
        },
        timeline: {
            title: "Timeline",
            text: "Choose based on how much time you can dedicate to learning"
        },
        additionalInfo: {
            title: "Extra Details",
            text: "Share your interests, constraints, or preferences (e.g., 'Interested in AI', 'Part-time only', 'Remote work preferred')"
        }
    };

    return (
        <div className="w-full rounded-xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-8 text-center md:text-left">
                <h2 className="mb-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Build Your Career Roadmap
                </h2>
                <p className="text-muted-foreground">
                    Tell us about yourself and your goals - we'll create a personalized roadmap just for you! 🎯
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!user && (
                    <div className="space-y-2 relative">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Your Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => handleFocus('name')}
                            onBlur={handleBlur}
                            placeholder="John Doe"
                            required
                        />
                        {focusedField === 'name' && (
                            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md md:hidden animate-in fade-in zoom-in-95 duration-200">
                                {fieldHelp.name.text}
                            </div>
                        )}
                    </div>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 relative">
                        <label htmlFor="currentRole" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Where are you now?
                        </label>
                        <input
                            id="currentRole"
                            name="currentRole"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.currentRole}
                            onChange={handleChange}
                            onFocus={() => handleFocus('currentRole')}
                            onBlur={handleBlur}
                            placeholder="e.g., Student, Graduate..."
                            required
                        />
                        {/* Mobile Hint (Absolute) */}
                        {focusedField === 'currentRole' && (
                            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md md:hidden animate-in fade-in zoom-in-95 duration-200">
                                {fieldHelp.currentRole.text}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 relative">
                        <label htmlFor="careerGoal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Dream Career Goal?
                        </label>
                        <input
                            id="careerGoal"
                            name="careerGoal"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.careerGoal}
                            onChange={handleChange}
                            onFocus={() => handleFocus('careerGoal')}
                            onBlur={handleBlur}
                            placeholder="e.g., Software Developer..."
                            required
                        />
                        {focusedField === 'careerGoal' && (
                            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md md:hidden animate-in fade-in zoom-in-95 duration-200">
                                {fieldHelp.careerGoal.text}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="skills" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Skills You Have <span className="text-xs font-normal italic text-muted-foreground">(optional)</span>
                    </label>
                    <input
                        id="skills"
                        name="skills"
                        type="text"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.skills}
                        onChange={handleChange}
                        onFocus={() => handleFocus('skills')}
                        onBlur={handleBlur}
                        placeholder="e.g., Python, Communication, or 'Beginner'"
                    />
                    {focusedField === 'skills' && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md md:hidden animate-in fade-in zoom-in-95 duration-200">
                            {fieldHelp.skills.text}
                        </div>
                    )}
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="timeline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Timeline to Achieve Goal
                    </label>
                    <select
                        id="timeline"
                        name="timeline"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.timeline}
                        onChange={handleChange}
                        onFocus={() => handleFocus('timeline')}
                        onBlur={handleBlur}
                        required
                    >
                        <option value="">Select timeline...</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="2 years">2 years</option>
                        <option value="3+ years">3+ years</option>
                    </select>
                    {focusedField === 'timeline' && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md md:hidden animate-in fade-in zoom-in-95 duration-200">
                            {fieldHelp.timeline.text}
                        </div>
                    )}
                </div>

                <div className="space-y-2 relative">
                    <label htmlFor="additionalInfo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Additional Details <span className="text-xs font-normal italic text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        onFocus={() => handleFocus('additionalInfo')}
                        onBlur={handleBlur}
                        placeholder="Any interests, constraints, or preferences..."
                        rows={3}
                    />
                    {focusedField === 'additionalInfo' && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md md:hidden animate-in fade-in zoom-in-95 duration-200">
                            {fieldHelp.additionalInfo.text}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full text-lg shadow-md hover:shadow-lg transition-all"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating Your Roadmap...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate My Roadmap
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RoadmapGenerator;
