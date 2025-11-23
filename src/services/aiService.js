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

Format the response in standard, clean markdown.
- Use **bold** for emphasis.
- Use headers (#, ##, ###) for sections.
- Use bullet points (-) for lists.
- Do NOT use code blocks, tables, or complex nesting.
- Keep the structure simple and easy to parse.
- Be specific, actionable, and encouraging.`;

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

/**
 * Review resume using Gemini AI
 */
export const reviewResume = async (resumeText) => {
    try {
        const prompt = `You are an expert Career Coach and HR Specialist with decades of experience in recruitment and talent acquisition. Your task is to provide a comprehensive, critical, and constructive review of the following resume text.

Resume Text:
${resumeText}

Please analyze the resume and provide the response in the following JSON format ONLY. Do not include any markdown formatting outside the JSON object.

{
  "scores": {
    "overall": 0-100,
    "impact": 0-100, // How well results are demonstrated
    "ats": 0-100, // Estimated ATS compatibility
    "formatting": 0-100,
    "content": 0-100
  },
  "summary": "Brief professional summary of the candidate (2-3 sentences)",
  "detailedAnalysis": {
    "formatting": "Critique of layout, readability, and organization",
    "content": "Evaluation of clarity, bullet points, and action verbs",
    "grammar": "Identification of typos or errors"
  },
  "atsOptimization": {
    "keywordsFound": ["list", "of", "keywords"],
    "missingKeywords": ["list", "of", "missing", "keywords"],
    "formattingIssues": ["list", "of", "issues"]
  },
  "valueAssessment": {
    "salaryRange": "e.g. $80k - $120k",
    "marketDemand": "Assessment of demand"
  },
  "improvements": [
    "Specific actionable improvement 1",
    "Specific actionable improvement 2"
  ],
  "bestPractices": [
    "Tip 1",
    "Tip 2"
  ]
}

Be honest, critical, yet encouraging. Ensure the JSON is valid.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        });

        const text = response.candidates[0].content.parts[0].text;
        // Clean up potential markdown code blocks if the model adds them
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error reviewing resume:', error);
        throw new Error('Failed to review resume. Please try again.');
    }
};

/**
 * Save resume review to Firestore
 */
export const saveResumeReview = async (userId, reviewData, fileName) => {
    try {
        const { db } = await import('../config/firebase');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { getGuestId } = await import('./migrationService');

        const effectiveUserId = userId || getGuestId();

        await addDoc(collection(db, 'resumes'), {
            userId: effectiveUserId,
            content: reviewData, // This is now a JSON object
            fileName,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving resume review:', error);
    }
};
