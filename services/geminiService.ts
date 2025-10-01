import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Candidate, RankedCandidate, BiasAuditReport, JobRequisition, JobStatus, EmailTemplateType, InterviewStage } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateEmail = async (templateType: EmailTemplateType, candidateName: string, jobTitle: string, companyName: string, keyPoints: string): Promise<string> => {
    let promptIntro = '';

    switch (templateType) {
        case EmailTemplateType.InterviewInvite:
            promptIntro = `
                You are a friendly and efficient recruiting coordinator. Your task is to write a professional and clear interview invitation email.
                The key points include details like the interview time, location (or video call link), and interviewers.
            `;
            break;
        case EmailTemplateType.FollowUp:
            promptIntro = `
                You are a helpful senior recruiter. Your task is to write a professional follow-up email.
                This could be to check in after an application, provide an update on the hiring timeline, or ask for more information.
            `;
            break;
        case EmailTemplateType.Rejection:
        default:
            promptIntro = `
                You are a senior recruiter with high emotional intelligence. Your task is to write an empathetic, professional, and encouraging rejection email.
                Incorporate the specific feedback in a constructive and positive way. Avoid generic phrases.
            `;
            break;
    }
    
    const prompt = `
        ${promptIntro}

        Details:
        - Candidate Name: ${candidateName}
        - Job Title: ${jobTitle}
        - Company Name: ${companyName}
        - Key Points to Include: ${keyPoints}

        Instructions:
        1. Address the candidate by name.
        2. Thank them for their time and interest.
        3. Clearly state the purpose of the email based on the template type (${templateType}).
        4. Incorporate the key points naturally into the email body.
        5. Keep the tone appropriate for the template type (e.g., warm and encouraging for rejection, clear and concise for invitation).
        6. Do not invent details not provided.
        7. The output should be only the email body text.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating email:", error);
        return "Sorry, I encountered an error while generating the email. Please check the console for details.";
    }
};

export const parseResume = async (resumeText: string): Promise<Partial<Candidate>> => {
    const prompt = `
        You are an expert resume parser for a recruiting agency. 
        Analyze the following resume text and extract the specified information.

        Resume Text:
        ---
        ${resumeText}
        ---

        Your task is to return a single JSON object with the following fields. If a field is not found, omit it or return an empty string.
        - name: The candidate's full name (string).
        - email: The candidate's email address (string).
        - phone: The candidate's phone number (string).
        - skills: A comma-separated string of relevant skills.
        - resumeSummary: A concise 3-4 sentence summary of the candidate's experience and qualifications based on the entire resume.
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
                        name: { type: Type.STRING },
                        email: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        skills: { type: Type.STRING },
                        resumeSummary: { type: Type.STRING },
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Partial<Candidate>;
    } catch (error) {
        console.error("Error parsing resume:", error);
        throw new Error("Failed to parse resume. The AI model might have returned an invalid format.");
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

export const parseAvailability = async (text: string, timezone: string): Promise<{startTime: string, endTime: string}[]> => {
    const prompt = `
        You are an intelligent scheduling assistant. Your task is to parse the following text for available time slots and return them as structured data.

        - Today's date is: ${new Date().toISOString()}.
        - The user's timezone is: ${timezone}.
        - The desired interview duration is 30 minutes.

        Availability Text:
        ---
        ${text}
        ---

        Instructions:
        1. Identify all concrete time ranges from the text.
        2. Break these ranges down into 30-minute slots.
        3. Return a JSON array of objects. Each object must represent a single 30-minute slot and have "startTime" and "endTime" properties.
        4. Both "startTime" and "endTime" MUST be in full ISO 8601 format in UTC (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").
        5. If the text is vague (e.g., "sometime next week"), return an empty array.
    `;
    
    try {
        // FIX: Explicitly typing the response variable ensures that the return value of the function is correctly inferred, preventing downstream type errors.
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
                            startTime: { type: Type.STRING },
                            endTime: { type: Type.STRING },
                        },
                        required: ["startTime", "endTime"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText);
        // FIX: Cast the parsed result to the expected return type.
        return parsedResult as {startTime: string, endTime: string}[];
    } catch (error) {
        console.error("Error parsing availability:", error);
        throw new Error("Failed to parse availability. Please try being more specific with dates and times.");
    }
};

export const generateSchedulingEmail = async (candidateName: string, jobTitle: string, interviewStage: InterviewStage, timeSlots: string[], interviewers: string[], videoLink: string): Promise<string> => {
    const isPanelInterview = interviewers.length > 1;
    
    const prompt = `
        You are a friendly and efficient recruiting coordinator. Your task is to write an email to a candidate to schedule their interview.

        Details:
        - Candidate Name: ${candidateName}
        - Job Title: ${jobTitle}
        - Interview Stage: ${interviewStage}
        ${interviewers.length > 0 ? `- Interviewers: ${interviewers.join(', ')}` : ''}
        ${videoLink ? `- Video Conference Link: ${videoLink}` : ''}
        - Proposed Time Slots:\n${timeSlots.join('\n')}

        Instructions:
        1. Write a warm and professional email.
        2. Address the candidate by their first name.
        3. State the purpose of the email: to schedule the ${interviewStage}.
        ${interviewers.length > 0 ? `4. Mention that they will be meeting with ${interviewers.join(' and ')}.` : ''}
        5. Present the proposed time slots clearly in a list.
        ${isPanelInterview
            ? '6. Ask the candidate to reply with their preferred time, noting that it needs to work for all interviewers.'
            : '6. Ask the candidate to reply with their preferred time.'}
        ${videoLink
            ? '7. Inform them that the video call link is included in this email and they should use it to join at the scheduled time.'
            : '7. Mention that a formal calendar invitation with a video conference link will be sent after they confirm a time.'}
        8. Keep the tone enthusiastic and organized.
        9. The output should be only the email body text.
    `;

    try {
        // FIX: Explicitly typing the response variable for type safety and consistency.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating scheduling email:", error);
        return "Sorry, I encountered an error while generating the email.";
    }
};