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

Please analyze the resume and provide a detailed report in standard markdown format. Do NOT use code blocks. Use bold text for emphasis.

The report MUST include the following sections:

1. **Executive Summary & Scores**
   - **Overall Score**: (0-100)
   - **Impact Score**: (High/Medium/Low) - How well the resume demonstrates results.
   - **ATS Compatibility Score**: (0-100) - Estimate based on formatting and keyword usage.
   - Brief summary of the candidate's profile (2-3 sentences).

2. **Detailed Analysis**
   - **Formatting & Structure**: Critique the layout, readability, and organization.
   - **Content Quality**: Evaluate the clarity, strength of bullet points, and use of action verbs.
   - **Grammar & Consistency**: Identify typos, grammatical errors, or inconsistencies.

3. **ATS Optimization**
   - **Keywords Found**: List strong industry-relevant keywords present.
   - **Missing Keywords**: Suggest critical keywords that are missing based on the candidate's likely target role.
   - **Formatting Issues**: Highlight any elements that might confuse ATS (e.g., tables, graphics).

4. **Value Assessment**
   - **Estimated Salary Range**: Provide a realistic salary range (e.g., $80k - $120k) based on the experience level and skills shown. Mention that this varies by location (e.g., "In major tech hubs like SF/NY...").
   - **Market Demand**: Assess the current demand for this profile.

5. **Actionable Improvements**
   - Provide a numbered list of specific, high-impact changes to improve the resume immediately.
   - Suggest specific rewrites for weak bullet points.

6. **Best Practices & Tips**
   - General advice for tailoring this resume for specific job applications.

Format the output clearly with headers (#, ##) and bullet points. Be honest but encouraging.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        });

        return response.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error reviewing resume:', error);
        throw new Error('Failed to review resume. Please try again.');
    }
};
