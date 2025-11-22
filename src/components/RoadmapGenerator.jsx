import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    canGuestGenerate,
    incrementGuestUsage,
    canUserGenerate,
    incrementUserUsage
} from '../services/usageService';
import { generateCareerRoadmap, saveRoadmap } from '../services/aiService';
import './RoadmapGenerator.css';

const RoadmapGenerator = ({ onRoadmapGenerated }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        currentRole: '',
        careerGoal: '',
        skills: '',
        timeline: '',
        additionalInfo: ''
    });
    const [lastSubmittedData, setLastSubmittedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user changes form
        if (error) setError('');
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
                : canGuestGenerate();

            if (!canGenerate) {
                setError(
                    user
                        ? "You've reached your free generation limit. Upgrade to continue!"
                        : "You've used your free trial. Please sign up to get 2 more free roadmaps!"
                );
                setLoading(false);
                return;
            }

            // Generate roadmap
            const roadmap = await generateCareerRoadmap(formData);

            // Increment usage counter
            if (user) {
                await incrementUserUsage(user.uid);
            } else {
                incrementGuestUsage();
            }

            // Save roadmap to Firestore
            await saveRoadmap(user?.uid, roadmap, formData);

            // Store submitted data to prevent duplicates
            setLastSubmittedData({ ...formData });

            // Pass roadmap to parent component
            onRoadmapGenerated(roadmap, formData);

        } catch (err) {
            setError(err.message || 'Failed to generate roadmap. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="roadmap-generator">
            <div className="generator-header">
                <h2>Build Your Career Roadmap</h2>
                <p className="text-muted">
                    Tell us about your career goals, and our AI will create a personalized roadmap to help you get there.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="generator-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="currentRole" className="form-label">
                            Current Role / Position
                        </label>
                        <input
                            id="currentRole"
                            name="currentRole"
                            type="text"
                            className="form-input"
                            value={formData.currentRole}
                            onChange={handleChange}
                            placeholder="e.g., Junior Web Developer"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="careerGoal" className="form-label">
                            Career Goal / Target Role
                        </label>
                        <input
                            id="careerGoal"
                            name="careerGoal"
                            type="text"
                            className="form-input"
                            value={formData.careerGoal}
                            onChange={handleChange}
                            placeholder="e.g., Senior Full-Stack Engineer"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="skills" className="form-label">
                        Current Skills & Technologies
                    </label>
                    <input
                        id="skills"
                        name="skills"
                        type="text"
                        className="form-input"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g., JavaScript, React, Node.js, Git"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="timeline" className="form-label">
                        Desired Timeline
                    </label>
                    <select
                        id="timeline"
                        name="timeline"
                        className="form-select"
                        value={formData.timeline}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select timeline...</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="2 years">2 years</option>
                        <option value="3+ years">3+ years</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="additionalInfo" className="form-label">
                        Additional Information (Optional)
                    </label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        className="form-textarea"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        placeholder="Any specific interests, constraints, or preferences we should know about..."
                        rows={4}
                    />
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg generate-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                            Generating Your Roadmap...
                        </>
                    ) : (
                        <>
                            <span>✨</span>
                            Generate My Roadmap
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RoadmapGenerator;
