import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Candidate, RankedCandidate, BiasAuditReport, JobRequisition, JobStatus } from './types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateFeedbackEmail = async (candidateName: string, jobTitle: string, companyName: string, feedback: string): Promise<string> => {
    const prompt = `
        You are a senior recruiter with high emotional intelligence. Your task is to write an empathetic, professional, and encouraging rejection email.

        Details:
        - Candidate Name: ${candidateName}
        - Job Title: ${jobTitle}
        - Company Name: ${companyName}
        - Specific Feedback/Reason: ${feedback}

        Instructions:
        1. Address the candidate by name.
        2. Thank them for their time and interest.
        3. Clearly state that they have not been selected for this specific role at this time.
        4. Incorporate the specific feedback in a constructive and positive way. Avoid generic phrases.
        5. Encourage them to apply for future roles that may be a better fit.
        6. Keep the tone warm, respectful, and professional.
        7. Do not invent details not provided.
        8. The output should be only the email body text.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating feedback email:", error);
        return "Sorry, I encountered an error while generating the email. Please check the console for details.";
    }
};

export const rankCandidates = async (jobDescription: string, candidates: Candidate[]): Promise<RankedCandidate[]> => {
    const prompt = `
        You are an expert talent acquisition partner with a knack for identifying hidden potential. 
        Given the following job description and a list of candidate summaries, please rank them based on their suitability for the role.

        Job Description:
        ---
        ${jobDescription}
        ---

        Candidates:
        ---
        ${candidates.map(c => `ID: ${c.id}, Name: ${c.name}, Summary: ${c.resumeSummary}`).join('\n\n')}
        ---

        Your task is to return a JSON array of objects. Each object should represent a candidate and include:
        - id: The candidate's original ID (number).
        - name: The candidate's name (string).
        - rank: Their rank (number, starting from 1).
        - matchScore: A score from 0 to 100 representing their match to the job description (number).
        - reasoning: A brief, insightful explanation for their rank and score, highlighting strengths and potential gaps (string).
        - cultureFit: A brief analysis of their potential cultural fit based on soft skills or traits mentioned in their summary (string).
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            name: { type: Type.STRING },
                            rank: { type: Type.NUMBER },
                            matchScore: { type: Type.NUMBER },
                            reasoning: { type: Type.STRING },
                            cultureFit: { type: Type.STRING },
                        },
                        required: ["id", "name", "rank", "matchScore", "reasoning", "cultureFit"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as RankedCandidate[];
    } catch (error) {
        console.error("Error ranking candidates:", error);
        throw new Error("Failed to rank candidates. See console for details.");
    }
};

export const auditJobDescription = async (jobDescription: string): Promise<BiasAuditReport> => {
    const prompt = `
        You are an expert in Diversity, Equity, and Inclusion (DEI) specializing in hiring practices. 
        Analyze the following job description for potential biases (e.g., gendered language, ageism, exclusionary terminology, ableism).

        Job Description:
        ---
        ${jobDescription}
        ---

        Your task is to provide a detailed audit. Return a single JSON object with the following structure:
        - overallScore: A number from 0 to 100, where 100 is perfectly inclusive and 0 is highly biased.
        - summary: A brief one-paragraph summary of the job description's inclusivity.
        - suggestions: An array of objects, where each object identifies a biased phrase and offers a more inclusive alternative. Each object should have:
            - originalText: The problematic text from the job description.
            - suggestion: The recommended inclusive alternative.
            - explanation: A brief explanation of why the original text is problematic and why the suggestion is better.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.NUMBER },
                        summary: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    originalText: { type: Type.STRING },
                                    suggestion: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                },
                                required: ["originalText", "suggestion", "explanation"],
                            }
                        }
                    },
                    required: ["overallScore", "summary", "suggestions"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as BiasAuditReport;
    } catch (error) {
        console.error("Error auditing job description:", error);
        throw new Error("Failed to audit job description. See console for details.");
    }
};

export const getJobRequisitionSuggestion = async (requisition: JobRequisition, previousStatus: JobStatus, newStatus: JobStatus): Promise<string> => {
    const prompt = `
        You are an AI assistant for a recruiter. A job requisition's status has just been changed. Provide a brief, actionable suggestion based on this change.

        Job Details:
        - Title: ${requisition.title}
        - Department: ${requisition.department}
        - Status Change: From "${previousStatus}" to "${newStatus}"

        Examples of good suggestions:
        - If status becomes Open: "This role is now active. Consider starting a new sourcing campaign on LinkedIn for candidates with ${requisition.requiredSkills.join(', ')} skills."
        - If status becomes On Hold: "This role is paused. How about moving the top 3 candidates from this pipeline to the similar 'Senior Backend Engineer' role?"
        - If status becomes Closed: "Great, this role is filled! Based on recent market trends for this role, should we consider opening a similar 'Mid-Level' position to build the talent pipeline for next quarter?"

        Based on the provided job details, generate a single, concise suggestion. The output should be only the suggestion text.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating job requisition suggestion:", error);
        return "Could not generate a suggestion at this time.";
    }
};