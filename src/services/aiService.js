import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

/**
 * Generate career roadmap using Gemini AI
 */
export const generateCareerRoadmap = async (userInputs) => {
    try {
        const { currentRole, careerGoal, skills, timeline, additionalInfo } = userInputs;

        // Create detailed prompt for career roadmap
        const prompt = `You are an expert career advisor and professional development coach. Create a detailed, personalized career roadmap based on the following information:

Current Role: ${currentRole}
Career Goal: ${careerGoal}
Current Skills: ${skills}
Timeline: ${timeline}
${additionalInfo ? `Additional Context: ${additionalInfo}` : ''}

Please provide a comprehensive career roadmap that includes:

1. **Executive Summary**: Brief overview of the career transition path (2-3 sentences)

2. **Gap Analysis**: Identify the key skills, experiences, and qualifications needed to bridge the gap between the current role and the career goal

3. **Learning Path** (organized by priority):
   - Technical skills to develop
   - Soft skills to enhance
   - Certifications or courses to pursue
   - Recommended resources (books, online courses, platforms)

4. **Action Plan** (broken down by timeframe):
   - Short-term (0-3 months): Immediate actions to take
   - Medium-term (3-12 months): Building expertise and experience
   - Long-term (1-2+ years): Advanced development and positioning

5. **Milestones & Checkpoints**: Key achievements to aim for along the journey

6. **Networking & Experience**:
   - Communities to join
   - Ways to gain relevant experience
   - Networking strategies

7. **Job Search Strategy**: How to position yourself when the time comes to make the transition

Format the response in clear, well-structured markdown with headers, bullet points, and emphasis where appropriate. Be specific, actionable, and encouraging. Focus on practical steps the person can take.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        });
        console.log("GEMINI RESPONSE", response);
        // Extract text from the response structure
        const roadmap = response.candidates[0].content.parts[0].text;
        return roadmap;
    } catch (error) {
        console.error('Error generating roadmap:', error);
        throw new Error('Failed to generate career roadmap. Please try again.');
    }
};

/**
 * Save roadmap to Firestore (for future history feature)
 */
export const saveRoadmap = async (userId, roadmapContent, userInputs) => {
    try {
        console.log("SAVING ROADMAP", userId, roadmapContent, userInputs);
        const { db } = await import('../config/firebase');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { getGuestId } = await import('./migrationService');

        // Use unique guest ID if no user ID provided
        const effectiveUserId = userId || getGuestId();

        await addDoc(collection(db, 'roadmaps'), {
            userId: effectiveUserId,
            content: roadmapContent,
            userInputs,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving roadmap:', error);
        // Don't throw - saving is not critical
    }
};
