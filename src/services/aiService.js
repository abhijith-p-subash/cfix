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

        // Provide user-friendly error messages
        if (error.message?.includes('API key')) {
            throw new Error('AI service is currently unavailable. Please try again later.');
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        }

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
        const prompt = `You are a Senior Career Coach and Executive Recruiter with 20+ years of experience at top-tier tech and Fortune 500 companies. You have reviewed thousands of resumes and know exactly what hiring managers and ATS systems look for.

Your task is to provide a deeply critical, yet constructive and actionable review of the following resume. Your goal is to transform this resume into a top 1% application.

Resume Text:
${resumeText}

Analyze the resume and provide the response in the following JSON format ONLY. Do not include any markdown formatting outside the JSON object.

{
  "scores": {
    "overall": 0-100,
    "impact": 0-100, // Focus on quantifiable results (numbers, %, $)
    "ats": 0-100, // Keyword optimization and formatting
    "formatting": 0-100, // Visual hierarchy, readability, consistency
    "content": 0-100 // Clarity, action verbs, storytelling
  },
  "summary": "A professional, 2-3 sentence executive summary of the candidate's current standing and potential.",
  "detailedAnalysis": {
    "formatting": "Specific critique of the layout, font choice, margins, and visual consistency. Mention if it looks modern or outdated.",
    "content": "Deep dive into the bullet points. Are they task-based or achievement-based? Do they use strong action verbs? Is the storytelling compelling?",
    "grammar": "Identify specific typos, grammatical errors, or inconsistent tense usage."
  },
  "atsOptimization": {
    "keywordsFound": ["list", "of", "strong", "keywords", "found"],
    "missingKeywords": ["critical", "missing", "keywords", "for", "target", "role"],
    "formattingIssues": ["list", "of", "ATS", "blockers", "like", "tables", "columns", "icons"]
  },
  "valueAssessment": {
    "salaryRange": "e.g. $120k - $150k (based on experience & location)",
    "marketDemand": "High/Medium/Low - with a brief explanation of the current market for this role."
  },
  "improvements": [
    "Actionable Tip 1: Be very specific. E.g., 'Rewrite the bullet point about X to include Y metric.'",
    "Actionable Tip 2: Focus on high-impact changes.",
    "Actionable Tip 3: Suggest removing irrelevant sections if necessary.",
    "Actionable Tip 4: Advice on tailoring for specific roles."
  ],
  "bestPractices": [
    "General tip for resume excellence",
    "Tip about LinkedIn profile alignment"
  ]
}

Be specific. Avoid generic advice. If a bullet point is weak, explain WHY and suggest a fix.`;

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

        // Provide user-friendly error messages
        if (error.message?.includes('API key')) {
            throw new Error('AI service is currently unavailable. Please try again later.');
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else if (error.message?.includes('JSON')) {
            throw new Error('Error processing AI response. Please try again.');
        }

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
